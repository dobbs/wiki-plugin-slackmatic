"use strict";

const moment = require('moment')

// TODO: high expectations for interacting with messages
// transform slack message into wiki item
// observe filter control & adapt display accordingly
// render images
// render slack markdown
// activate links
// replace emoji
// replace at-mentions
// compute delta times from zero in filter control
// special click to change filter control
// editor to annotate a message

const expand = text => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*(.+?)\*/g, '<i>$1</i>');
};

const concatAttachments = attachments => attachments
      .filter(it => it.text)
      .map(it => it.text)
      .join("\n")

const transformMessageToItem = ({baseurl, channel}) => message => {
  let speaker = message.user || message.bot_id
  speaker = (speaker) ? `<@${speaker}>` : 'unknown'
  let timestamp = moment.unix(message.ts)
  let id = message.ts.replace(/\./,'-')
  let displayTime = timestamp.format('h:mm:ss a')
  let body = concatAttachments([message, ...(message.attachments||[])])
  return {
    id,
    type: 'slackmatic',
    slackmatic: 'message',
    text: `${speaker} ${displayTime} ${body}`,
    slack: message,
    url: `${baseurl}p${message.ts.replace(/\./,'')}`,
    baseurl,
    channel,
    speaker,
    timestamp,
    displayTime
  }
}

const annotate = text => text.replace(/\S+/g,'<span>$&</span>')
const words = text => Array.from(text.match(/(\S+)/g))

const emit = ($item, item) => {
  item.text
    .split(/\n{2,}/)
    .map(line => `<p>${annotate(expand(line))}</p>`)
    .forEach(p => $item.append(p))
}

const find = ($page, word) => {
  let title = $page.data('data').title.replace(/\d\d:\d\d:\d\d/, word)
  const story = $page.find('.item.slackmatic')
        .filter((i, div) => {
          const item = $(div).data('item')
          return words(item.text).includes(word)
        })
        .map(function () { return $(this).data('item') })
        .get()
  wiki.showResult(wiki.newPage({
    title,
    story,
    journal: []
  }))
}

const bind = ($item, item) => {
  $item.dblclick(event => {
    event.preventDefault()
    event.stopPropagation()
    if (event.target.tagName === 'SPAN') {
      const word = event.target.innerText
      const $page = $item.parents('.page:first')
      find($page, word)
    } else {
      wiki.textEditor($item, item, {append: true})
    }
  })
}

module.exports = {
  emit,
  bind,
  transformMessageToItem
}
