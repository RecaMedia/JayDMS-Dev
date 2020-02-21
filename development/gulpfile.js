// Development File Structure
var MAIN_DIR = "../";

var DEV_DIR = MAIN_DIR + "development";
var PRO_DIR = MAIN_DIR + "project";
var ADM_DIR = PRO_DIR + "/jdms/admin"

var DEV_NODE = DEV_DIR + '/node_modules';
var DEV_API = DEV_DIR + "/api/**/*.php";
var DEV_BUILDER = DEV_DIR + "/builder/**/*.php";
var DEV_CONTROLLER = DEV_DIR + "/controller/**/*.php";
var DEV_VENDOR_DL = DEV_DIR + "/vendors/directory-lister/**/*.php";
var DEV_JSX = DEV_DIR + "/jsx/**/*.jsx";
var DEV_CSS = DEV_DIR + "/css/**/*.css";
var DEV_SASS = DEV_DIR + "/sass/**/*.scss";
var DEV_JSX_ADM = DEV_DIR + "/jsx/admin.jsx";

var ADM_CSS = ADM_DIR + "/assets/css";
var ADM_JS = ADM_DIR + "/assets/js";
var ADM_API = ADM_DIR + "/core/api";
var ADM_BUILDER = ADM_DIR + "/core/builder";
var ADM_CONTROLLER = ADM_DIR + "/core/controller";
var ADM_VENDOR_DL = ADM_DIR + "/core/vendors/directory-lister";

var WATCH_FILES = [ADM_CSS,ADM_JS];

// Include gulp/gulp plugins
var historyApiFallback = require('connect-history-api-fallback');
var gulp = require('gulp');
var notify = require('gulp-notify');
var browserSync = require('browser-sync').create();
var buffer = require('vinyl-buffer');

gulp.task('set_to_dev', function(done) {
	process.env.NODE_ENV = 'development';
	done();
});

gulp.task('set_to_prod', function(done) {
	process.env.NODE_ENV = 'production';
	done();
});

// API / PHP
gulp.task('copy-php', function() {
	gulp.src(DEV_API).pipe(gulp.dest(ADM_API));
	gulp.src(DEV_BUILDER).pipe(gulp.dest(ADM_BUILDER));
	gulp.src(DEV_CONTROLLER).pipe(gulp.dest(ADM_CONTROLLER));
	return gulp.src(DEV_VENDOR_DL).pipe(gulp.dest(ADM_VENDOR_DL));
});

gulp.task('minify-php', function() {
	var phpMinify = require('@aquafadas/gulp-php-minify');

	gulp.src(DEV_API, {read: false}).pipe(phpMinify()).pipe(gulp.dest(ADM_API));
	gulp.src(DEV_BUILDER, {read: false}).pipe(phpMinify()).pipe(gulp.dest(ADM_BUILDER));
	gulp.src(DEV_CONTROLLER, {read: false}).pipe(phpMinify()).pipe(gulp.dest(ADM_CONTROLLER));
	return gulp.src(DEV_VENDOR_DL, {read: false}).pipe(phpMinify()).pipe(gulp.dest(ADM_VENDOR_DL));
});

// Sass Task
gulp.task('build-sass', function() {
	var sass = require('gulp-sass');
	var concat = require('gulp-concat');
	var merge = require('merge-stream');

	var sassOptions = {
		errLogToConsole: true,
		linefeed: 'lf', // 'lf'/'crlf'/'cr'/'lfcr'
		outputStyle: 'expanded', // 'nested','expanded','compact','compressed'
		sourceComments: false,
		includePaths: []
	};

	var scssStream = gulp.src(DEV_SASS)
		.pipe(sass(sassOptions))
		.on("error", notify.onError({
			message: 'Error: <%= error.message %>'
		}))
		.pipe(concat('scss-files.scss'));

	var cssStream1 = gulp.src(DEV_NODE + '/jodit/build/jodit.min.css')
		.pipe(concat('css-files.css'));

	return merge(cssStream1, scssStream)
		.pipe(concat('admin.css'))
		.pipe(browserSync.stream())
		.pipe(gulp.dest(ADM_CSS));
});

gulp.task('deploy-sass', function() {
	var sass = require('gulp-sass');
	var cssmin = require('gulp-cssmin');
	var bless = require('gulp-bless');
	var concat = require('gulp-concat');
	var merge = require('merge-stream');

	var sassOptions = {
		errLogToConsole: true,
		outputStyle: 'compressed',
		sourceComments: false
	}

	var scssStream = gulp.src(DEV_SASS)
		.pipe(sass(sassOptions))
		.on("error", notify.onError({
			message: 'Error: <%= error.message %>'
		}))
		.pipe(concat('scss-files.scss'));
	
	var cssStream1 = gulp.src(DEV_NODE + '/jodit/build/jodit.min.css')
		.pipe(concat('css-files.css'));

	return merge(cssStream1, scssStream)
		.pipe(concat('admin-min.css'))
		.pipe(cssmin())
		// in order for bless to work correctly it needs to strip out comments before it parses the CSS
		.pipe(bless({
			cacheBuster: true,
			cleanup: true,
			compress: true
		}))
		.pipe(gulp.dest(ADM_CSS));
});

// React Task
gulp.task('build-react', function() {
	var browserify = require('browserify');
	var source = require('vinyl-source-stream');
	var header = require('gulp-header');
	var bundle_name = 'admin.js';

	return browserify({
		entries: DEV_JSX_ADM,
		extensions: ['.jsx'],
		debug: true
	}).transform('babelify', {presets: ['es2015', 'react']})
	.bundle()
	.pipe(source(bundle_name))
	.pipe(buffer())
	.pipe(header('const DEVMODE = true;'))
	.pipe(browserSync.stream())
	.pipe(gulp.dest(ADM_JS));
});

gulp.task('deploy-react', function() {
	var browserify = require('browserify');
	var source = require('vinyl-source-stream');
	var gConcat = require('gulp-concat');
	var minifyJS = require('gulp-minify');
	var header = require('gulp-header');
	var bundle_name = 'admin.js';

	var pkg = require('./package.json');
	var banner = ['/**',
	' * <%= pkg.name %> - <%= pkg.description %>',
	' * @version v<%= pkg.version %>',
	' * @link <%= pkg.homepage %>',
	' * @license <%= pkg.license %>',
	' */',
	'const DEVMODE = false;',
	''].join('\n');
	return browserify({
		entries: DEV_JSX_ADM,
		extensions: ['.jsx'],
		debug: false
	})
	.transform('babelify', {presets: ['es2015', 'react']})
	.bundle()
	.pipe(source(bundle_name))
	.pipe(buffer())
	.pipe(gConcat(bundle_name))
	.pipe(minifyJS())
	.pipe(header(banner, {pkg: pkg}))
	.pipe(gulp.dest(ADM_JS));
});

// Templates Watch
gulp.task('watch', function() {

	browserSync.init({
		files: ["./index.php"],
		server: {
			baseDir: ADM_DIR,
			middleware: [ historyApiFallback() ]
		}
	});

	gulp.watch(DEV_API, gulp.series('copy-php'));
	gulp.watch(DEV_BUILDER, gulp.series('copy-php'));
	gulp.watch(DEV_CONTROLLER, gulp.series('copy-php'));
	gulp.watch(DEV_VENDOR_DL, gulp.series('copy-php'));

	gulp.watch(DEV_JSX, gulp.series('build-react'));
	gulp.watch(DEV_SASS, gulp.series('build-sass'));
	gulp.watch(WATCH_FILES, browserSync.reload);
});

// Tasks
gulp.task('build', gulp.series(gulp.parallel('set_to_dev', 'copy-php', 'build-sass', 'build-react')));
gulp.task('deploy', gulp.series(gulp.parallel('set_to_prod', 'copy-php', 'deploy-sass', 'deploy-react')));
gulp.task('default', gulp.series(gulp.parallel('set_to_dev', 'build', 'watch')));