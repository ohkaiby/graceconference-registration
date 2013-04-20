var path = require( 'path' );

module.exports = function( grunt ) {
	var js_library_source_files = [
			'app/js/libraries/jquery-1.9.1.js',
			'app/js/libraries/bootstrap.js',
			'app/js/libraries/lodash.js',
			'app/js/libraries/backbone.js',
			'app/js/libraries/hogan.js'
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
					'app/css/compiled/1-app.css' : 'app/css/app/app.less',
					'app/css/compiled/2-responsive.css' : 'app/css/app/responsive.less'
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
				globals: {
					module : false,
					require : false,
					Modernizr : false,
					jQuery : false,
					Backbone : false,
					gc : false,
					_ : false,
					tester : false,
					console : false
				}
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
		hogan : {
			raw : {
				options : {
					namespace : 'gc.templates',
					prettify : false,
					defaultName : function( filename ) {
						return path.basename( filename, '.stache' );
					}
				},
				files : {
					'./app/js/compiled/templates.min.js' : [ './app/views/templates/**/*.stache' ]
				}
			}
		},
		watch: {
			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: [ 'jshint:gruntfile', 'concat:js_libraries', 'uglify:js_libraries', 'jshint:app', 'concat:js_app'/*, 'uglify:js_app'*/, 'less:production', 'concat:css' ]
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
				tasks : [ 'jshint:app', 'concat:js_app'/*, 'uglify:js_app'*/ ]
			},
			css : {
				files : [ 'app/css/app/*.less' ],
				tasks : [ 'less:production', 'concat:css' ]
			},
			templates : {
				files : [ 'app/views/templates/*.stache' ],
				tasks : [ 'hogan' ]
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
	grunt.loadNpmTasks('grunt-contrib-hogan');

	// grunt.registerMultiTask( 'hoganize_templates', 'Compiles raw templates to hogan.js.', hoganizeTask );

	// Default task.
	grunt.registerTask('default', ['jshint', 'less', /*'qunit',*/ 'concat', /*'uglify',*/ 'hogan']);
};
