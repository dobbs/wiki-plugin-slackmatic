"use strict";

const moment = require('moment')

const concatAttachments = attachments => attachments
      .filter(it => it.text)
      .map(it => it.text)
      .join("\n")

module.exports = ({baseurl, channel}) => message => {
  let speaker = message.user || message.bot_id
  speaker = (speaker) ? `<@${speaker}>` : 'unknown'
  let timestamp = moment.unix(message.ts)
  let id = message.ts.replace(/\./,'-')
  let displayTime = timestamp.format('h:mm:ss a')
  let body = concatAttachments([message, ...(message.attachments||[])])
  let hasThread = message.hasOwnProperty('thread_ts') &&
      message.thread_ts === message.ts

  return {
    id,
    type: 'slackmatic',
    slackmatic: 'message',
    text: `${speaker} ${displayTime} ${body}`,
    slack: message,
    hasThread,
    url: `${baseurl}p${message.ts.replace(/\./,'')}`,
    baseurl,
    channel,
    speaker,
    timestamp,
    displayTime
  }
}
