/*
*	Front-end project
*/
const	gulp = require('gulp'),
fs = require('fs'),
data = require('gulp-data'),
clean = require('gulp-clean'),
rename = require('gulp-rename'),
autoprefixer = require('gulp-autoprefixer'),
cleanCSS = require('gulp-clean-css'),
sass = require('gulp-sass'),
prettify = require('gulp-prettify'),
imagemin = require('gulp-imagemin'),
sourcemaps = require('gulp-sourcemaps'),
webpack = require('webpack-stream'),
nunjucks = require('gulp-nunjucks-render'),
plumber = require('gulp-plumber'),
browserSync = require('browser-sync').create(),
dotenv = require('dotenv').config({ path: './.env' });

var errorHandler = function(e) {
  console.log(e.message || e);
  this.emit('end');
};

/*
*	BROWSERSYNC
*/
gulp.task('browser-sync', function() {
	return browserSync.init({
    proxy: dotenv.parsed.PROXY_URL,
		notify: false,
		open: false,
    ghostMode: false,
	});
});
gulp.task('browser-sync-open', function() {
	return browserSync.init({
		proxy: dotenv.parsed.PROXY_URL,
		notify: false,
		browser: 'google chrome',
    ghostMode: false,
	});
});

/*
*	SCSS
*/
gulp.task('scss', function() {
	return gulp.src(['src/scss/styles.scss', 'src/scss/styleguide.scss'])
	.pipe(plumber({ errorHandler: errorHandler }))
	.pipe(sourcemaps.init())
	.pipe(sass({ outputStyle: 'uncompressed' }))
	.pipe(gulp.dest('dist/assets/css'))
	.pipe(autoprefixer({ browsers: ['last 2 versions'] }))
	.pipe(cleanCSS({ compatibility: 'ie8' }))
	.pipe(rename({ extname: '.min.css' }))
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest('dist/assets/css'))
	.pipe(browserSync.stream());
});

/*
*	JS
*/
gulp.task('js', function(){
  return gulp.src('src/js/index.js')
  .pipe(plumber())
  .pipe(webpack(require('./webpack.config.js')))
  .pipe(gulp.dest('dist/assets/js'));
});

/*
*	IMAGES
*/
gulp.task('image', function() {
	return gulp.src('src/img/**/*')
	.pipe(plumber())
	.pipe(imagemin({ verbose: true }))
	.pipe(gulp.dest('dist/assets/img'));
});

/*
*	COPY
*/
let copyTypes = ["font"], copyTasks = [];
copyTypes.forEach(function(type){
	copyTasks.push('copy:' + type);
	gulp.task('copy:' + type, function() {
		return gulp.src(['src/' + type + '/**/*'])
		.pipe(plumber())
		.pipe(gulp.dest('dist/assets/' + type));
	});
});

/*
*	HTML
*/
let locales = ["fr"], localeTasks = [], localeDefault = "fr";
locales.forEach(function(locale){
  localeTasks.push('html:' + locale);
  gulp.task('html:' + locale, function() {
    return gulp.src(['src/html/pages/' + locale + '/**/*.html'])
    .pipe(plumber())
    .pipe(data(function() {
      let data = JSON.parse(fs.readFileSync('./src/html/data/strings.json'));
      let localeData = data[locale];
      localeData.locale = locale;
      return localeData;
    }))
    .pipe(nunjucks({
      path: ['src/html/templates'],
    }))
    .pipe(prettify({
      indent_size: 2,
      unformatted: ['pre', 'code', 'sup'],
    }))
    .pipe(gulp.dest(locale == localeDefault ? 'dist' : 'dist/' + locale));
  });
});

/*
*	WATCH
*/
gulp.task('watch', function() {
	gulp.watch(['src/scss/**/*.scss'], gulp.series('scss'));
	gulp.watch(['src/js/**/*.js'], gulp.series('js'));
	gulp.watch(['src/html/**/*'], gulp.series('html'));
	gulp.watch(['src/img/**/*'], gulp.series('image'));
	gulp.watch(['dist/**/*.html', 'dist/assets/js/*.js']).on('change', browserSync.reload);
});

/*
*	CLEAN
*/
gulp.task('clean', function () {
	return gulp.src('dist', {read: false, allowEmpty:true})
	.pipe(plumber())
	.pipe(clean());
});

/*
*	TASKS
*/
gulp.task('copy', gulp.series(copyTasks));
gulp.task('html', gulp.parallel(localeTasks));
gulp.task('reload', gulp.parallel(['browser-sync', 'watch']));
gulp.task('default', gulp.parallel(['browser-sync-open', 'watch']));
gulp.task('build', gulp.series(['html', 'scss', 'js', 'image', 'copy']));
gulp.task('start', gulp.series('clean', 'build', 'default'));
