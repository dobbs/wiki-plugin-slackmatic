"use strict";

(function() {
  var bind, emit, expand;

  const registerCustomElements = (document, customElements) => {
    var CryptoJS = require('crypto-js')
    console.log({CryptoJS})

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
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(editorTemplate.content.cloneNode(true))
      }

      connectedCallback() {
        if (super.connectedCallback)
          super.connectedCallback()
        console.log({
          THIS: this,
          shadowRoot: this.shadowRoot,
          querySelector: this.shadowRoot.querySelector
        })
        this.shadowRoot.querySelector('form').addEventListener('submit', event => {
          event.preventDefault()
          event.stopPropagation()
          console.log('save', {event})
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
        ${expand(item.text || 'intentionally blank')}
      </p>`)
  }

  bind = function($item, item) {
    return $item.dblclick(() => {
      $item.html('<slackmatic-editor></slackmatic-editor>')
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
