module.exports = function (grunt) {
  grunt.initConfig({
    concat: {
      javascript: {
        src: [
          'node_modules/jquery/dist/jquery.min.js',
          'node_modules/angular/angular.min.js',
          'node_modules/oclazyload/dist/ocLazyLoad.min.js',
          'node_modules/angular-ui-router/release/angular-ui-router.min.js',
          'node_modules/angular-animate/angular-animate.min.js',
          'node_modules/angular-aria/angular-aria.min.js',
          'node_modules/angular-messages/angular-messages.min.js',
          'node_modules/angular-material/angular-material.min.js',
          'node_modules/d3/d3.min.js',
          'node_modules/nvd3/build/nv.d3.min.js',
          'node_modules/angular-nvd3/dist/angular-nvd3.min.js',
          'node_modules/ngmap/build/scripts/ng-map.min.js',
          'node_modules/socket.io-client/dist/socket.io.min.js',
          'node_modules/three/build/three.min.js',
          'node_modules/three/examples/js/loaders/OBJLoader.js'
        ],
        dest: 'public/res/scripts/gruntscripts.js'
      },
      styling: {
        src: [
          'node_modules/angular-material/angular-material.min.css',
          'node_modules/nvd3/build/nv.d3.min.css'
        ],
        dest: 'public/res/styles/gruntstyles.css'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat']);
}
