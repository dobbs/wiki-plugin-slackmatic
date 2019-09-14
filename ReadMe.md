# Federated Wiki - Slackmatic Plugin

This plugin, type: slackmatic, extends the markup of the federated wiki.

## Build

    npm install
    grunt build

    cd ~/wiki-tls
    docker-compose exec farm bash
    # now inside the container...
    ( \
      cd ~/fedwiki/wiki-plugin-slackmatic \
      && node_modules/grunt/bin/grunt build \
      && npm pack \
      && cd ~/lib/node_modules/wiki \
      && npm install ~/fedwiki/wiki-plugin-slackmatic/wiki-plugin-slackmatic-0.1.0.tgz \
    )

## Publish

    grunt build
    npm pack | tail -1
    # upload the tarball to a public web site
    # npm install $TARBALL_URL

## License

MIT
