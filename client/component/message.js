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

const annotate = text => text.replace(/\S+/g,'<span>$&</span>')
const words = text => Array.from(text.match(/(\S+)/g))

const emit = ($item, item) => {
  item.text
    .split(/\n{2,}/)
    .map(line => `<p>${annotate(line)}</p>`)
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
  $item.on('dragstart', event => {
    console.log({where:'slackmatic message dragstart'})
    event.dataTransfer.setData('text', item.url)
  })
}

module.exports = {
  emit,
  bind
}
