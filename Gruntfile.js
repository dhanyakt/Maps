'use-strict';

var ngrok = require('ngrok');

module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    // configuration
    grunt.initConfig({
        // css minification
        cssmin: {
            first_target: {
                files: [{
                    expand: true,
                    cwd: 'css/',
                    src: ['*.css'],
                    dest: 'docs/css/',
                    ext: '.min.css'
                }]
            }
        },

        // JS minification
        uglify: {
            first_target: {
                files: {
                    'docs/js/app.min.js':['js/app.js']
                },
            }
        },

        // Inlining css
        inline: {
            build: {
                options: {
                    cssmin: true,
                    uglify: true
                },
                src: ['*.html'],
                dest: 'docs/'
            }
        },


// HTML minification
        htmlmin: {
            build: {
                options: {
                    removeComments:true,
                    collapseWhitespace:true
                },
                files: {
                    'build/index.html':'build/index.html'
                }
            }
        },

// Plugin to know the pagespeed score in mobile and desktop.
        pagespeed: {
            options: {
                nokey: true,
                locale: "en_GB",
                threshold:30
            },
            local: {
                options: {
                    strategy: "desktop"
                }
            },
            mobile: {
                options: {
                    strategy: "mobile"
                }
            },
        }
    });

// Grunt tasks
    grunt.loadNpmTasks('grunt-inline');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');

// Integration of ngrok with pagespeed.
    grunt.registerTask('psi-ngrok','Run pagespeed with ngrok', function() {
        var done = this.async();
        var port = 8000;
        ngrok.connect(port, function(err,url){
            if(err !== null) {
                grunt.fail.fatal(err);
                return done();
            }

            grunt.config.set('pagespeed.options.url', url);
            grunt.task.run('pagespeed');
            done();
        });
    });

// Grunt tasks
    grunt.registerTask('default',['uglify','cssmin','inline','htmlmin','psi-ngrok']);
};