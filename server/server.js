// slackmatic plugin, server-side component
// These handlers are launched with the wiki server.

(function() {
  const slack = require('slack')

  const startServer = async ({app, argv}) => {

    app.post('/plugin/slackmatic/echo', (req, res) => {
      let {body} = req
      return res.json({body})
    })

    app.post('/plugin/slackmatic/users.conversations', async (req, res) => {
      let {token}  = req.body
      try {
        let slackres = await slack.users.conversations({token})
        return res.json(slackres)
      } catch (err) {
        return res.json({err})
      }
    })

    app.post('/plugin/slackmatic/conversations.history', async (req, res) => {
      let {token, channel, oldest, latest, title, cursor, inclusive=true}  = req.body
      let slackres
      try {
        slackres = await slack.conversations.history({
          token, channel, oldest, latest, cursor, inclusive /* TODO how do we handle cursor? */
        })
        return res.json(slackres)
      } catch (err) {
        return res.json({err, response: slackres})
      }
    })

    app.post('/plugin/slackmatic/conversations.replies', async (req, res) => {
      let {token, channel, ts, oldest, latest, title, cursor, inclusive=true}  = req.body
      let slackres
      try {
        slackres = await slack.conversations.replies({
          token, channel, ts, oldest, latest, cursor, inclusive /* TODO how do we handle cursor? */
        })
        return res.json(slackres)
      } catch (err) {
        return res.json({err, response: slackres})
      }
    })

  }

  module.exports = {startServer}

}).call(this)
