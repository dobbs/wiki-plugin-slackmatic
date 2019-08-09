"use strict";

const {onDragover, onDrop} = require('./slackClient.js')

module.exports = document => {
  // dropZone is a state machine
  // three states: active, missingToken, editing
  // three behaviors:
  //   double-click
  //   save
  //   detect presence or absence of slackbot-token

  // active & missingToken:
  //   check for slackbot-token in localStorage
  //   when present: switch to active
  //   when missing: switch to missingToken
  //
  //   double-click: switch to editing
  //
  // active:
  //   drop: import slack messages (or show error page)
  //
  // editing:
  //   save: update localStorage and switch to active

  const active = {}, missingToken = {}, editing = {}
  var state = active

  const parseTokenFromForm = (form) => {
    let formData = Object.fromEntries(new FormData(form).entries())
    return formData.token
  }
  const saveToken = (token) => localStorage.setItem('slackbot-token', token)
  const createSlackmaticItem = ($item, item) => {
    if (! item.slackmatic || item.slackmatic != 'token') {
      wiki.pageHandler.put($item.parents('.page:first'), {
        type: 'edit',
        id: item.id,
        item: {
          ...item,
          slackmatic: 'token'
        }
      })
    }
  }
  editing.emit = ($item, item) => {
    $item.html(state.template.content.cloneNode(true))
    const form = $item.find('form')[0]
    form.token.value = localStorage.getItem('slackbot-token') || ''
  }
  editing.bind = ($item, item) => {
    const form = $item.find('form')[0]
    form.addEventListener('submit', event => {
      event.stopPropagation()
      event.preventDefault()
      let token = parseTokenFromForm(form)
      saveToken(token)
      createSlackmaticItem($item, item)
      state = active
      state.emit($item, item)
      state.bind($item, item)
    })
  }

  const dblclickToEdit = ($item, item) => {
    $item.dblclick(event => {
      event.stopPropagation()
      event.preventDefault()
      state = editing
      state.emit($item, item)
      state.bind($item, item)
    })
  }
  const dropToImportFromSlack = ($item, item) => {
    const el = $item.get(0)
    el.addEventListener('dragover', onDragover)
    el.addEventListener('drop', onDrop)
  }
  active.emit = ($item, item) => {
    const token = localStorage.getItem('slackbot-token')
    if (! token) {
      state = missingToken
      state.emit($item, item)
    } else {
      $item.html(state.template.content.cloneNode(true))
    }
  }
  active.bind = ($item, item) => {
    dblclickToEdit($item, item)
    dropToImportFromSlack($item, item)
  }

  missingToken.emit = ($item, item) => {
    const token = localStorage.getItem('slackbot-token')
    if (token) {
      state = active
      state.emit($item, item)
    } else {
      $item.html(state.template.content.cloneNode(true))
    }
  }
  missingToken.bind = ($item, item) => {
    dblclickToEdit($item, item)
  }

  editing.template = document.createElement('template')
  editing.template.innerHTML = `
    <section style="margin-bottom: 1em; padding: 15px; background-color: #eee;">
      <form>
      <input name="token" type="text" placeholder="slackbot token" value=""
             style="box-sizing: border-box; width: 100%;" />
      <input type="submit" value="save"
             style="box-sizing: border-box; width: 100%;" />
      </form>
    </section>`

  active.template = document.createElement('template')
  active.template.innerHTML = `
    <section style="margin-bottom: 1em; padding: 15px; background-color: #eee;">
      <div>Slackmatic <i>active</i></div>
    </section>`

  missingToken.template = document.createElement('template')
  missingToken.template.innerHTML = `
    <section style="margin-bottom: 1em; padding: 15px; background-color: #eee;">
      <div>Slackmatic <i style="color: red;">missing token</i></div>
    </section>`

  editing.template = document.createElement('template')
  editing.template.innerHTML = `
    <section style="margin-bottom: 1em; padding: 15px; background-color: #eee;">
      <form>
      <input name="token" type="text" placeholder="slackbot token" value=""
             style="box-sizing: border-box; width: 100%;" />
      <input type="submit" value="save"
             style="box-sizing: border-box; width: 100%;" />
      </form>
    </section>`


  const emit = ($item, item) => state.emit($item, item)

  const bind = ($item, item) => state.bind($item, item)

  const editor = ($item, item) => {
    state = editing
    state.emit($item, item)
    state.bind($item, item)
  }

  return {emit, bind, editor}
}
