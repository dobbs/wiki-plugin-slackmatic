"use strict";

(function() {
  const dropZone = require('./component/dropZone.js')

  const expand = text => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*(.+?)\*/g, '<i>$1</i>');
  };

  if (typeof window !== "undefined" && window !== null) {
    window.plugins.slackmatic = dropZone(document)
  }

  if (typeof module !== "undefined" && module !== null) {
    module.exports = {expand};
  }

}).call(this);
