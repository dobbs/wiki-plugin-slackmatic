"use strict";

const moment = require('moment')

const concatAttachments = attachments => attachments
      .filter(it => it.text)
      .map(it => it.text)
      .join("\n")

const transformMessageBasics = ({user, ts, thread_ts, bot_id}, {baseurl, channel}) => {
  let speaker = user || bot_id
  speaker = (speaker) ? `<@${speaker}>` : 'unknown'
  let timestamp = moment.unix(ts)
  let id = `${channel}-${ts.replace(/\./,'-')}`
  let displayTime = timestamp.format('h:mm:ss a')
  let hasThread = thread_ts !== undefined && thread_ts === ts
  let url = `${baseurl}p${ts.replace(/\./, '')}`
  if (hasThread)
    url += `?thread_ts=${thread_ts}&cid=${channel}`
  return {id, speaker, timestamp, displayTime, hasThread, url}
}

module.exports = ({baseurl, channel}) => message => {
  const {id, speaker, timestamp, displayTime, hasThread, url} =
        transformMessageBasics(message, {baseurl, channel})
  const {ts, thread_ts} = message
  let body = concatAttachments([message, ...(message.attachments||[])])
  let replies = (message.replies||[]).map(reply => {
    let {id, speaker, timestamp, displayTime, hasThread, url} =
        transformMessageBasics({...reply, thread_ts:message.thread_ts},
                               {baseurl, channel})
    return {
      id,
      type: 'slackmatic',
      slackmatic: 'message',
      text: `${speaker} ${displayTime} ...`,
      slack:reply,
      hasThread,
      url,
      baseurl,
      channel,
      speaker,
      timestamp,
      displayTime,
      isReply: true
    }
  })

  return [{
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
    displayTime,
    isReply: false
  }, ...replies]
}
