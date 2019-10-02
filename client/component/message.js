"use strict";

const moment = require('moment')
const marked = require('marked')
const transformMessageToItem = require('./transformMessageToItem.js')

// TODO: high expectations for interacting with messages
// observe filter control & adapt display accordingly
// replace emoji
// replace at-mentions
// compute delta times from zero in filter control
// special click to change filter control
// editor to annotate a message

const markedOptions = {
  gfm: true,
  linksInNewTab: true,
  breaks: true
}

const annotate = text => text.replace(/\S+/g,'<span>$&</span>')
const words = text => Array.from(text.match(/(\S+)/g))

const emit = ($item, item) => {
  $item.append(marked(item.text, markedOptions))
  if (item.isReply) {
    $item.css({paddingLeft:'30pt'})
  }
  if (item.slack && item.slack.attachments) {
    const {attachments} = item.slack
    const $domFragment = attachments.reduce((acc, attachment) => {
      const {image_url, fallback} = attachment
      if (image_url) {
        acc.push($(`<div><img alt="${fallback}" src="${image_url}" width="100%">\n</div>`))
      } else {
        console.log({item, unrenderedAttachment: attachment})
      }
      return acc
    }, [])
    $item.append($domFragment)
  }
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
  bind
}
