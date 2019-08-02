// build time tests for slackmatic plugin
// see http://mochajs.org/

(function() {
  const slackmatic = require('../client/client'),
        expect = require('expect.js');

  describe('slackmatic plugin', () => {
    describe('expand', () => {
      it('can make itallic', () => {
        var result = slackmatic.expand('hello *world*');
        return expect(result).to.be('hello <i>world</i>');
      });
    });
  });

}).call(this);
