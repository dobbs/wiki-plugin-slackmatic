"use strict";

(function() {
  const dropZoneFactory = require('./component/dropZone.js')
  const message = require('./component/message.js')

  const expand = text => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*(.+?)\*/g, '<i>$1</i>');
  };

  const chooseComponent = (dz, m) => item => {
    return (item.slackmatic && item.slackmatic === 'message')
      ? m
      : dz
  }

  if (typeof window !== "undefined" && window !== null) {
    const dropZone = dropZoneFactory(document)
    const chooseComponent = item => {
      return (item.slackmatic && item.slackmatic === 'message')
        ? message
        : dropZone
    }
    window.plugins.slackmatic = {
      emit: ($item, item) => chooseComponent(item).emit($item, item),
      bind: ($item, item) => chooseComponent(item).bind($item, item),
      editor: dropZone.editor
    }
  }

  if (typeof module !== "undefined" && module !== null) {
    module.exports = {expand};
  }

}).call(this);
