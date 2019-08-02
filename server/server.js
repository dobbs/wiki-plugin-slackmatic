// slackmatic plugin, server-side component
// These handlers are launched with the wiki server.

(function() {
  const slack = require('slack')

  const startServer = async ({app, argv}) => {

    app.post('/plugin/slackapi/echo', (req, res) => {
      let {body} = req
      return res.json({body})
    })

    app.post('/plugin/slackapi/users.conversations', async (req, res) => {
      let {token}  = req.body
      try {
        let slackres = await slack.users.conversations({token})
        return res.json(slackres)
      } catch (err) {
        return res.json({err})
      }
    })

    app.post('/plugin/slackapi/conversations.history', async (req, res) => {
      let {token, channel, oldest, latest, title, cursor}  = req.body
      let slackres
      try {
        slackres = await slack.conversations.history({
          token, channel, oldest, latest, cursor /* TODO how do we handle cursor? */
        })
        return res.json(slackres)
      } catch (err) {
        return res.json({err, response: slackres})
      }
    })

  }

  module.exports = {startServer}

}).call(this)
