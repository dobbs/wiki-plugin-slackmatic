"use strict";

(function() {
  const dropZoneFactory = require('./component/dropZone.js')
  const moreButtonFactory = require('./component/moreButton.js')
  const message = require('./component/message.js')

  const expand = text => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*(.+?)\*/g, '<i>$1</i>');
  };

  if (typeof window !== "undefined" && window !== null) {
    const dropZone = dropZoneFactory(document)
    const moreButton = moreButtonFactory(document)
    const chooseComponent = ({slackmatic}) => ({
      message,
      moreButton,
      token: dropZone
    }[slackmatic] || dropZone)
    const emit = ($item, item) => chooseComponent(item).emit($item, item)
    const bind = ($item, item) => chooseComponent(item).bind($item, item)
    window.plugins.slackmatic = {
      emit,
      bind,
      editor: dropZone.editor
    }
  }

  if (typeof module !== "undefined" && module !== null) {
    module.exports = {expand};
  }

}).call(this);
