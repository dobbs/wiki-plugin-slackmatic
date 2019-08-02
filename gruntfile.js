module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-git-authors');

  grunt.initConfig({
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    browserify: {
      "client/slackmatic.js": ['client/client.js']
    },

    watch: {
      all: {
        files: ['client/client.js', 'test/*.js', 'server/*.js'],
        tasks: ['build']
      }
    }
  });

  grunt.registerTask('build', ['mochaTest', 'browserify']);
  grunt.registerTask('default', ['build']);

};
