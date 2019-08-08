"use strict";

(function() {
  var bind, emit, expand, template, editor;

  const moment = require('moment')

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
    let token = localStorage.getItem('slackbot-token')
    if (token)
      $item.find('[data-id=message]').html('<i>active</i>')
    else
      $item.find('[data-id=message]').html('<i style="color: red">missing token</i>')
  }

  editor = ($item, item) => {
    $item.html(template.editor.content.cloneNode(true))
    const form = $item.find('form')[0]
    form.token.value = localStorage.getItem('slackbot-token') || ''
    form.addEventListener('submit', event => {
      event.stopPropagation()
      event.preventDefault()
      let formData = Object.fromEntries(new FormData(form).entries())
      localStorage.setItem('slackbot-token', formData.token)
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
      emit($item, item)
      bind($item, item)
    })
  }

  const transformSlackToPage = (title, json) => {
    let messages = (json.messages||[]).reverse()
    return {
      title: title,
      story: messages.map(message => {
        let speaker = message.user || message.bot_id
        speaker = (speaker) ? `<@${speaker}>` : 'unknown'
        let timestamp = moment.unix(message.ts)
        let id = Math.floor(timestamp)
        let displayTime = timestamp.format('h:mm:ss a')
        let body = message.text
        if (body === ''
            && message.attachments
            && message.attachments.length > 0
            && message.attachments[0].text
           ) {
          body = message.attachments[0].text
        }
        return {
          id,
          type: 'paragraph',
          text: `${speaker} [[${displayTime}]] ${body}`,
          slack: message,
          speaker,
          timestamp,
          displayTime
        }
      })
    }
  }

  const conversationHistory = async ({token, channel, oldest='', latest='', cursor=''}) => {
    let url = new URL('/plugin/slackmatic/conversations.history', window.location)
    let res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        channel,
        oldest,
        latest,
        cursor
      })
    })
    return await res.json()
  }

  const parseSlackURL = (url) => {
    let [channel, messageId] = url.split('/').slice(4)
    let timestamp = moment(parseInt(messageId.substr(1))/1000, 'x')
    return {channel, timestamp}
  }

  bind = ($item, item) => {
    $item.dblclick(() => { editor($item, item) })
    $item.on('drop', async event => {
      event.preventDefault()
      event.stopPropagation()
      let url = event.originalEvent.dataTransfer.getData("text")
      let {channel, timestamp} = parseSlackURL(url)
      let oldest = timestamp.format('X')
      console.log({where:'slackmatic bind', url, channel, oldest})
      let token = localStorage.getItem('slackbot-token')
      let history
      try {
        history = await conversationHistory({token, channel, oldest})
        wiki.showResult(wiki.newPage(transformSlackToPage('this page no title', history)))
      } catch (err) {
        console.log('slackapi create form ERROR', {err, history})
      }
    })
  }

  if (typeof window !== "undefined" && window !== null) {
    template = createTemplate(document)
    window.plugins.slackmatic = {emit, bind, editor}
  }

  if (typeof module !== "undefined" && module !== null) {
    module.exports = {expand};
  }

}).call(this);
