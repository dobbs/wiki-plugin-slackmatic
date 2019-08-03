"use strict";

(function() {
  var bind, emit, expand, template, editor;

  const CryptoJS = require('crypto-js')

  const createTemplate = document => {
    const display = document.createElement('template')
    display.innerHTML = `
    <section style="margin-bottom: 1em; padding: 15px; background-color: #eee;">
      <div>Slackmatic Drop Zone</div>
      <div data-id="message"></div>
    </section>`

    const editor = document.createElement('template')
    editor.innerHTML = `
    <section style="margin-bottom: 1em; padding: 15px; background-color: #eee;">
      <form>
      <input name="token" type="text" placeholder="slackbot token" value=""
             style="box-sizing: border-box; width: 100%;" />
      <input type="submit" value="save"
             style="box-sizing: border-box; width: 100%;" />
      </form>
    </section>`

    return  {display, editor}
  }

  expand = text => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*(.+?)\*/g, '<i>$1</i>');
  };

  emit = ($item, item) => {
    $item.html(template.display.content.cloneNode(true))
    $item.find('[data-id=message]').html(expand(item.token || ''))
  }

  editor = ($item, item) => {
    $item.html(template.editor.content.cloneNode(true))
    const form = $item.find('form')[0]
    form.token.value = item.token || ''
    form.addEventListener('submit', event => {
      event.stopPropagation()
      event.preventDefault()
      const newEntries = Array.from(form.elements).reduce((all, input) => {
        if (input.name)
          all[input.name] = input.value
        return all
      }, {})
      const newItem = Object.assign({}, item, newEntries)
      wiki.pageHandler.put($item.parents('.page:first'), {
        type: 'edit',
        id: newItem.id,
        item: newItem
      })
      emit($item, newItem)
      bind($item, newItem)
    })
  }

  bind = function($item, item) {
    $item.dblclick(() => { editor($item, item) })
  }

  if (typeof window !== "undefined" && window !== null) {
    template = createTemplate(document)
    window.plugins.slackmatic = {emit, bind, editor}
  }

  if (typeof module !== "undefined" && module !== null) {
    module.exports = {expand};
  }

}).call(this);
