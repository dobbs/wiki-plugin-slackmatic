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
const words = text => text.match(/(\S+)/g)

const emit = ($item, item) => {
  item.text
    .split(/\n{2,}/)
    .map(line => `<p>${annotate(line)}</p>`)
    .forEach(p => $item.append(p))
}

const bind = ($item, item) => {
  $item.click(event => {
    event.preventDefault()
    event.stopPropagation()
    if (event.target.tagName === 'SPAN') {
      console.log({
        where:'slackmatic-message click',
        itemId: item.id,
        word: event.target.innerText,
      })
    }
  })
}

module.exports = {
  emit,
  bind
}
