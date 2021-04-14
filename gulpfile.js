const gulp = require('gulp');
const less = require('gulp-less');
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const htmlmin = require('gulp-htmlmin');
const clean = require('gulp-clean');
const doxx = require('gulp-doxx');
const replace = require('gulp-replace');
const iife = require('gulp-iife');
const inlinesource = require('gulp-inline-source');
const imagemin = require('gulp-imagemin');
const base64 = require('gulp-base64');
const svgstore = require('gulp-svgstore');
const inject = require('gulp-inject');
const rename = require('gulp-rename');
const gls = require('gulp-live-server');
const sourcemaps = require('gulp-sourcemaps');
const { series } = require('gulp');

const paths = {};

paths.less = [
  './src/less/*.less',
];

const buildLess = () => gulp.src(paths.less)
  .pipe(less())
  .pipe(cssnano())
  .pipe(concat('map.min.css'))
  .pipe(gulp.dest('./dist'));

paths.js = [
  'bower_components/google-maps-v3-infobox/infobox.js',
  'bower_components/dynamics.js/lib/dynamics.min.js',
  'src/js/extend/googleMaps.js',
  'src/js/bootstrap.js',
  'src/js/util.js',
  'src/js/request.js',
  'src/js/const/*.js',
  'src/js/model/marker.js',
  'src/js/model/track.js',
  'src/js/model/kml.js',
  'src/js/service/i18n.js',
  'src/js/service/chart.js',
  'src/js/service/map.js',
  'src/js/service/storage.js',
  'src/js/service/dialog.js',
  'src/js/service/event.js',
  'src/js/service/geolocation.js',
  'src/js/loader.js',
  'src/js/api.js',
  'src/js/init.js',
];

const buildJs = () => gulp.src(paths.js)
  .pipe(sourcemaps.init())
  .pipe(concat('map.min.js'))
  .pipe(replace(/["']use strict["'];/g, ''))
  .pipe(iife({
    params: ['window', 'document', 'google', 'Promise'],
    args: ['window', 'document', 'google', 'Promise'],
  }))
  .pipe(uglify({
    mangle: true,
  }))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./dist'));

paths.html = [
  './src/index.html',
];

const buildImg = () => gulp.src('src/img/*')
  .pipe(imagemin())
  .pipe(gulp.dest('./dist/img'));

const buildHtml = () => {
  const svgs = gulp.src('./src/img/icon/*.svg')
    .pipe(rename({ prefix: 'icon-' }))
    .pipe(svgstore({ inlineSvg: true }));

  function fileContents(filePath, file) {
    return file.contents.toString();
  }

  return gulp
    .src(paths.html)
    .pipe(inject(svgs, { transform: fileContents }))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      minifyJS: true,
    }))
    .pipe(gulp.dest('./dist'));
};

const serve = () => {
  const server = gls.static(['.']);
  server.start();
};

const taskInlinesourceHtml = () => {
  let index = 0;
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const map = {};

  function getValue(string, namespace) {
    const name = `${namespace}__${string}`;
    let value = map[name];
    if (!value) {
      value = map[name] = alphabet[index];
      index++;
    }
    return value;
  }

  return gulp.src('./dist/index.html')
    .pipe(inlinesource())
    .pipe(base64())
    // id selectors
    .pipe(replace(/(#|id="|getElementById\(")([a-z_]{7,}|chart|map)/g, (match, value_1, value_2) => value_1 + getValue(value_2, 'id')))
    // class selectors
    // TODO: minify class selectors
    /*
    .pipe(replace(/([},]\.|class="|getElementsByClassName\("|Class\(\w+\.div,")([a-z]{6,})/g, function (match, value_1, value_2) {
      return value_1 + getValue(value_2, 'class');
    }))
    */
  // misc
  // TODO: minify other selectors
  /* .pipe(replace(/(\[|\s)(marker)(\]|\s)/g, function (match, value_1, value_2, value_3) {
       return value_1 + getValue(value_2, 'misc') + value_3;
       })) */
  // methods
  // TODO: minify JS methods
    /* .pipe(replace(/(getParameterByName|getParameterPartsByName|I18N|placeMarker|addMarker|Marker|addTrack|Track|addKml|Kml|Loader|Chart|markerWrap|markerShadow|animateWobble|animateBounce|animateDrop|setOpaque|showInfoWindow|highlight|translate|fromLatLngToDivPixel)/g, function (match, value_1) {
     return getValue(value_1, 'method');
     })) */
    .pipe(replace('\n', ' '))
    .pipe(replace(/[\s]+/g, ' '))
    .pipe(gulp.dest('./dist'));
};

const taskInlinesourceClean = () => gulp.src([
  './dist/map.min.*',
  './dist/img',
], { read: false })
  .pipe(clean());

const taskInlinesource = series(
  taskInlinesourceHtml,
  taskInlinesourceClean,
);

/*

gulp.task('docs:clean', () => gulp.src([
  'docs/!*',
], { read: false })
  .pipe(clean()));

gulp.task('docs:copy:dist', () => gulp
  .src([
    'dist/!*',
    'dist/!**!/!*',
  ])
  .pipe(gulp.dest('docs/dist')));

gulp.task('docs:copy:examples', () => gulp
  .src([
    'examples/!**!/!*',
  ])
  .pipe(htmlmin({
    collapseWhitespace: true,
    removeComments: true,
    minifyJS: true,
    minifyCSS: true,
  }))
  .pipe(gulp.dest('docs/examples')));

gulp.task('docs:copy', [
  'docs:copy:dist',
  'docs:copy:examples',
]);

gulp.task('docs:documentation', () => gulp.src([
  './README.md',
  './src/!**!/!*.js',
], { base: '.' })
  .pipe(doxx({
    title: 'ФRuŠKać',
    urlPrefix: '/map',
  }))
  .pipe(replace(/http:\/\/(?!localhost)([^/]+)/g, '//$1')) // fix to allow https
  .pipe(gulp.dest('docs')));

gulp.task('docs', gulp.series(
  'docs:clean',
  'docs:copy',
  'docs:documentation',
));

gulp.task('watch', gulp.series(
  'build',
  gulp.parallel(
    'watch:js',
    'watch:less',
    'watch:html',
  ),
  'serve',
));

gulp.task('watch:js', () => {
  gulp.watch(paths.js, ['build:js']);
});

gulp.task('watch:less', () => {
  gulp.watch(paths.less, ['build:less']);
});

gulp.task('watch:html', () => {
  gulp.watch(paths.html, ['build:html']);
});

gulp.task('release', gulp.series(
  'build',
  'inlinesource',
  'docs',
)); */

const build = series(
  buildLess,
  buildJs,
  buildImg,
  buildHtml,
);

exports.default = build;
exports.buildLess = buildLess;
exports.buildJs = buildJs;
exports.buildImg = buildImg;
exports.buildHtml = buildHtml;
exports.serve = serve;
