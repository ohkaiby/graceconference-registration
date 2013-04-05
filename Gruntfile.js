/*global module:false*/
module.exports = function( grunt ) {
	var js_library_source_files = [
			'app/js/libraries/jquery-1.9.1.js',
			'app/js/libraries/bootstrap.js',
			'app/js/libraries/lodash.js',
			'app/js/libraries/backbone.js'
		];

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
			' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
		// Task configuration.
		less : {
			production : {
				options : {
					compress : true,
					yuicompress : true
				},
				files : {
					'app/css/compiled/0-bootstrap.min.css' : 'app/css/libraries/bootstrap.css',
					'app/css/compiled/1-app.css' : 'app/css/app/app.less'
				}
			}
		},
		concat: {
			options: {
				// banner: '<%= banner %>',
				stripBanners: true
			},
			js_libraries: {
				src: js_library_source_files,
				dest: 'app/js/compiled/libraries.js'
			},
			js_app : {
				src : [
					'app/js/app/form.js'
				],
				dest : 'app/js/compiled/app.js'
			},
			css : {
				src : [
					'app/css/compiled/**/*.css'
				],
				dest : 'app/css/app.min.css'
			}
		},
		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			js_libraries: {
				src: '<%= concat.js_libraries.dest %>',
				dest: 'app/js/compiled/libraries.min.js'
			},
			js_app : {
				src : '<%= concat.js_app.dest %>',
				dest : 'app/js/compiled/app.min.js'
			}
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				unused: true,
				boss: true,
				eqnull: true,
				browser: true,
				globals: {}
			},
			gruntfile: {
				src: 'Gruntfile.js'
			},
			//lib_test: {
			//src: ['lib/**/*.js', 'test/**/*.js']
			//},
			app : {
				src : 'app/js/app/**/*.js'
			}
		},
		// qunit: {
		//files: ['test/**/*.html']
		// },
		watch: {
			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: [ 'jshint:gruntfile', 'concat:js_libraries', 'uglify:js_libraries', 'jshint:app', 'concat:js_app', 'uglify:js_app', 'less:production', 'concat:css' ]
			},
			// lib_test: {
			//files: '<%= jshint.lib_test.src %>',
			//tasks: ['jshint:lib_test', 'qunit']
			// },
			js_lib : {
				files : js_library_source_files,
				tasks : [ 'concat:js_libraries', 'uglify:js_libraries' ]
			},
			js_app : {
				files : [ '<%= jshint.app.src %>' ],
				tasks : [ 'jshint:app', 'concat:js_app', 'uglify:js_app' ]
			},
			css : {
				files : [ 'app/css/app/base.less', 'app/css/app/app.less' ],
				tasks : [ 'less:production', 'concat:css' ]
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	// grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');

	// Default task.
	grunt.registerTask('default', ['jshint', 'less', /*'qunit',*/ 'concat', 'uglify']);
};
