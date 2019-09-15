"use strict";

const moment = require('moment')
const transformMessageToItem = require('./transformMessageToItem.js')

const transformSlackToPage = ({history, title, baseurl, channel}) => {
  let {messages} = history
  let story = (messages||[]).reverse().map(transformMessageToItem({baseurl, channel}))
  let last = story[story.length - 1]
  story.push({
    type: 'slackmatic',
    slackmatic: 'moreButton',
    text: 'intentionally blank',
    title,
    baseurl,
    channel,
    timestamp: last.timestamp,
    last
  })
  return {
    title,
    story
  }
}

const conversationHistory = async ({
  token, channel,
  oldest='',
  latest='',
  cursor='',
  inclusive=true
}) => {
  let url = new URL('/plugin/slackmatic/conversations.history', window.location)
  let res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      channel,
      oldest,
      latest,
      cursor,
      inclusive
    })
  })
  let json = await res.json()
  return json
}

const conversationReplies = async ({
  token, channel, ts,
  oldest='',
  latest='',
  cursor='',
  inclusive=true
}) => {
  let url = new URL('/plugin/slackmatic/conversations.replies', window.location)
  let res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      channel,
      ts,
      oldest,
      latest,
      cursor,
      inclusive
    })
  })
  let json = await res.json()
  return json
}

const isSlackArchiveUrlRE = /https:\/\/[^.]+\.slack\.com\/archives\//

const parseSlackArchiveURL = (url) => {
  let [channel, messageId] = url.split('/').slice(4)
  let [baseurl] = url.match(isSlackArchiveUrlRE)
  baseurl = `${baseurl}${channel}/`
  let timestamp = moment(parseInt(messageId.substr(1))/1000, 'x')
  return {baseurl, channel, timestamp}
}

const onDragover = event => {
  event.preventDefault()
  event.stopPropagation()
}

const onDrop = async event => {
  // TODO: separate these concerns
  // browser drop event management & data extraction
  // transformation of slack archive url into slack conversation API request
  // transformation of slack API response into wiki page
  // rendering page result
  // rendering error result for confusing input
  // reporting errors when any of the above fail
  event.preventDefault()
  event.stopPropagation()
  const dataTransfer = event.dataTransfer
  if (dataTransfer) {
    let url = dataTransfer.getData('text')
    if (isSlackArchiveUrlRE.test(url)) {
      let {baseurl, channel, timestamp} = parseSlackArchiveURL(url)
      let oldest = timestamp.format('X')
      console.log({where:'slackClient onDrop', url, channel, oldest})
      let token = localStorage.getItem('slackbot-token')
      let title = `Slack ${timestamp.format('MMM-DD HH:MM:SS')}`
      let history
      try {
        history = await conversationHistory({token, channel, oldest})
        wiki.showResult(wiki.newPage(transformSlackToPage({history, title, baseurl, channel})))
      } catch (err) {
        console.log('slackmatic onDrop handler ERROR', {err, history})
      }
    } else {
      wiki.showResult(wiki.newPage({
        title: 'Slackmatic Drop Failed',
        story: [
          {
            type: 'markdown',
            text: `don't know what to do with\n${url}`
          }
        ]
      }))
    }
  }
}

const createMoreMessagesListener = ({$item, item}) => {
  let currentStory = $item.closest('.page').data('data').story
  // pop() twice to remove the moreButton item & because
  // conversationHistory() below re-imports the last item.
  // yet another off-by-one bug
  currentStory.pop()
  currentStory.pop()
  let {title, channel, timestamp, baseurl} = item
  let oldest = moment(timestamp).format('X')

  return async event => {
    event.preventDefault()
    event.stopPropagation()
    let token = localStorage.getItem('slackbot-token')
    let history
    try {
      history = await conversationHistory({token, channel, oldest})
      let page = transformSlackToPage({history, title, baseurl, channel})
      page.story = [...currentStory, ...(page.story)]
      wiki.showResult(wiki.newPage(page))
    } catch (err) {
      wiki.showResult(wiki.newPage({
        title: 'Slackmatic More Messages Failed',
        story: [
          {
            type: 'markdown',
            text: `couldn't get conversation.history with\n${JSON.stringify({channel, oldest, inclusive})}`
          }
        ]
      }))
    }
  }
}

module.exports = {
  onDragover,
  onDrop,
  createMoreMessagesListener
}
