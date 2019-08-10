"use strict";

const moment = require('moment')

const transformSlackToPage = (title, json) => {
  let messages = (json.messages||[]).reverse()
  let {baseurl} = json
  return {
    title: title,
    story: messages.map(message => {
      let speaker = message.user || message.bot_id
      speaker = (speaker) ? `<@${speaker}>` : 'unknown'
      let timestamp = moment.unix(message.ts)
      let id = message.ts.replace(/\./,'-')
      let displayTime = timestamp.format('h:mm:ss a')
      let body = message.text
      if (body === ''
          && message.attachments
          && message.attachments.length > 0
          && message.attachments[0].text
         ) {
        body = message.attachments[0].text
      }
      return {
        id,
        type: 'slackmatic',
        slackmatic: 'message',
        text: `${speaker} ${displayTime} ${body}`,
        slack: message,
        url: `${baseurl}p${message.ts.replace(/\./,'')}`,
        speaker,
        timestamp,
        displayTime
      }
    })
  }
}

const conversationHistory = async ({token, channel, oldest='', latest='', cursor=''}) => {
  let url = new URL('/plugin/slackmatic/conversations.history', window.location)
  let res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      channel,
      oldest,
      latest,
      cursor
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
        history.baseurl = baseurl
        wiki.showResult(wiki.newPage(transformSlackToPage(title, history)))
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

module.exports = {
  onDragover,
  onDrop
}
