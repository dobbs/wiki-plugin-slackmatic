"use strict";

const moment = require('moment')

const transformSlackToPage = (title, json) => {
  let messages = (json.messages||[]).reverse()
  return {
    title: title,
    story: messages.map(message => {
      let speaker = message.user || message.bot_id
      speaker = (speaker) ? `<@${speaker}>` : 'unknown'
      let timestamp = moment.unix(message.ts)
      let id = Math.floor(timestamp)
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
        type: 'paragraph',
        text: `${speaker} [[${displayTime}]] ${body}`,
        slack: message,
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
  return await res.json()
}

const isSlackRE = /https:\/\/[^.]+\.slack\.com\/archives\//

const parseSlackURL = (url) => {
  let [channel, messageId] = url.split('/').slice(4)
  let timestamp = moment(parseInt(messageId.substr(1))/1000, 'x')
  return {channel, timestamp}
}

const onDragover = event => {
  event.preventDefault()
  event.stopPropagation()
}

const onDrop = async event => {
  event.preventDefault()
  event.stopPropagation()
  const dataTransfer = event.dataTransfer
  if (dataTransfer) {
    let url = dataTransfer.getData('text')
    if (isSlackRE.test(url)) {
      let {channel, timestamp} = parseSlackURL(url)
      let oldest = timestamp.format('X')
      console.log({where:'slackClient onDrop', url, channel, oldest})
      let token = localStorage.getItem('slackbot-token')
      let title = `Slack History ${timestamp.format('YYYY-MM-DD')}`
      let history
      try {
        history = await conversationHistory({token, channel, oldest})
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
