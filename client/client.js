"use strict";

(function() {
  var bind, emit, expand;

  const registerCustomElements = (document, customElements) => {
    const CryptoJS = require('crypto-js')

    const editorTemplate = document.createElement('template')
    editorTemplate.innerHTML = `
    <style>
     div { margin-bottom: 1em; padding: 15px; background-color: #eee; }
     input { box-sizing: border-box; width: 100%; }
    </style>
    <div>
      <form>
      <input name="hello" type="text" placeholder="say anything" value="" />
      <input type="submit" value="save" />
      </form>
    </div>`
    class SlackmaticEditor extends HTMLElement {
      constructor() {
        super()
        this.wikiItem = {}
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(editorTemplate.content.cloneNode(true))
      }

      set item (obj) { this.wikiItem = obj }
      get item () { return this.wikiItem }
      set saveHandler(fn) { this.save = fn }
      get saveHandler() { return this.save }

      connectedCallback() {
        if (super.connectedCallback)
          super.connectedCallback()
        if (this.item.hello)
          this.shadowRoot.querySelector('input[name=hello]').value = this.item.hello
        const form = this.shadowRoot.querySelector('form')
        form.addEventListener('submit', event => {
          event.preventDefault()
          event.stopPropagation()
          const newValues = Array.from(form.elements).reduce((all, item) => {
            if (item.name)
              all[item.name] = item.value
            return all
          }, {})
          const newItem = Object.assign({}, this.item, newValues)
          this.save(newItem)
        })
      }
    }
    customElements.define('slackmatic-editor', SlackmaticEditor)
    return SlackmaticEditor
  }

  expand = text => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*(.+?)\*/g, '<i>$1</i>');
  };

  emit = ($item, item) => {
    return $item.append(`
      <p style="background-color:#eee;padding:15px;">
        ${expand(`text: ${item.text ||'intentionally blank'} hello: ${item.hello || 'null'}`)}
      </p>`)
  }

  bind = function($item, item) {
    return $item.dblclick(() => {
      const editor = document.createElement('slackmatic-editor')
      editor.item = item
      editor.saveHandler = newItem => {
        wiki.pageHandler.put($item.parents('.page:first'), {
          type: 'edit',
          id: newItem.id,
          item: newItem
        })
      }
      $item.html(editor)
    })
  }

  if (typeof window !== "undefined" && window !== null) {
    let SlackmaticEditor = registerCustomElements(document, customElements)
    window.plugins.slackmatic = {emit, bind, SlackmaticEditor};
  }

  if (typeof module !== "undefined" && module !== null) {
    module.exports = {expand};
  }

}).call(this);
