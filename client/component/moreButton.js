"use strict";

const {createMoreMessagesListener,
       createRepliesListener} = require('./slackClient.js')

module.exports = document => {

  const template = document.createElement('template')
  template.innerHTML = `
    <section style="margin-bottom: 1em; padding: 15px; background-color: #eee;">
      <button data-id="more" style="box-sizing: border-box; width: 49%;" >
        More Messages</button>
      <button data-id="replies" style="box-sizing: border-box; width: 49%;" >
        Load Replies</button>
    </section>`

  const emit = ($item, item) => {
    $item.html(template.content.cloneNode(true))
  }

  const bind = ($item, item) => {
    let el = $item[0] // prefer ES6 to jQuery
    let form = el.querySelector('form')
    let more = createMoreMessagesListener({$item, item})
    let replies = createRepliesListener({$item, item})
    el.querySelector('button[data-id=more]')
      .addEventListener('click', more)
    el.querySelector('button[data-id=replies]')
      .addEventListener('click', replies)
  }

  return {
    emit,
    bind
  }
}
