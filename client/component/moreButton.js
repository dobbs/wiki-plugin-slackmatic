"use strict";

const {createMoreMessagesListener} = require('./slackClient.js')

module.exports = document => {

  const template = document.createElement('template')
  template.innerHTML = `
    <section style="margin-bottom: 1em; padding: 15px; background-color: #eee;">
      <form>
      <input name="more" type="submit" value="More Messages"
             style="box-sizing: border-box; width: 100%;" />
      </form>
    </section>`

  const emit = ($item, item) => {
    $item.html(template.content.cloneNode(true))
  }

  const bind = ($item, item) => {
    let el = $item[0] // prefer ES6 to jQuery
    let form = el.querySelector('form')
    let listener = createMoreMessagesListener({$item, item})
    form.addEventListener('submit', listener)
  }

  return {
    emit,
    bind
  }
}
