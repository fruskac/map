var gulp = require('gulp');
var less = require('gulp-less');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
var clean = require('gulp-clean');
var doxx = require('gulp-doxx');
var replace = require('gulp-replace');
var runSequence = require('run-sequence');
var ga = require('gulp-ga');
var sourcemaps = require('gulp-sourcemaps');
var iife = require('gulp-iife');

var paths = {};

var gaConfig = {
    url: 'auto',
    uid: 'UA-52141130-3',
    sendPageView: true
};

gulp.task('default', function () {
    runSequence(
        'build',
        'docs'
    );
});

gulp.task('build', [
    'less',
    'js',
    'img',
    'html'
]);

paths.less = [
    './src/less/*.less'
];

gulp.task('less', function () {
    return gulp.src(paths.less)
        .pipe(less())
        .pipe(cssnano())
        .pipe(concat('map.min.css'))
        .pipe(gulp.dest('./dist'));
});

paths.js = [
    'src/js/bootstrap.js',
    'src/js/util.js',
    'src/js/const/*.js',
    'src/js/extend/googleMaps.js',
    'map.config.js',
    'src/js/model/marker.js',
    'src/js/model/track.js',
    'src/js/model/kml.js',
    'src/js/service/i18n.js',
    'src/js/service/chart.js',
    'src/js/service/map.js',
    'src/js/service/storage.js',
    'src/js/loader.js',
    'src/js/api.js',
    'src/js/init.js',
];

gulp.task('js', function () {
    return gulp.src(paths.js)
        .pipe(sourcemaps.init())
        .pipe(concat('map.min.js'))
        .pipe(replace(/["']use strict["'];/g, ''))
        .pipe(iife({
            params: ['window', 'document', '$', '_', 'google', 'Promise'],
            args: ['window', 'document', 'jQuery', '_', 'google', 'Promise']
        }))
        .pipe(uglify({
            mangle: true
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist'));
});

paths.html = [
    './src/index.html'
];

gulp.task('img', function () {
    return gulp.src('src/img/*')
        .pipe(gulp.dest('./dist/img'))
});

gulp.task('html', function () {
    return gulp.src(paths.html)
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyJS: true
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('docs:clean', function () {
    return gulp
        .src([
            'docs/*'
        ], {read: false})
        .pipe(clean());
});

gulp.task('docs:copy:dist', function () {
    return gulp
        .src([
            'dist/*',
            'dist/**/*',
        ])
        .pipe(gulp.dest('docs/dist'));
});

gulp.task('docs:copy:data', function () {
    return gulp
        .src([
            'data/*',
            'data/**/*',
        ])
        .pipe(gulp.dest('docs/data'));
});

gulp.task('docs:copy:examples', function () {
    return gulp
        .src([
            'examples/**/*',
        ])
        .pipe(ga(gaConfig))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyJS: true,
            minifyCSS: true
        }))
        .pipe(gulp.dest('docs/examples'));
});

gulp.task('docs:copy', [
    'docs:copy:dist',
    'docs:copy:data',
    'docs:copy:examples'
]);

gulp.task('docs', function () {
    runSequence(
        'docs:clean',
        'docs:copy',
        function () {
            gulp.src([
                './README.md',
                './src/**/*.js'
            ], {base: '.'})
                .pipe(doxx({
                    title: 'ФRuŠKać',
                    urlPrefix: '/map'
                }))
                .pipe(replace(/http:\/\/([^/]+)/g, '//$1')) // fix to allow https
                .pipe(ga(gaConfig))
                .pipe(gulp.dest('docs'));
        }
    );
});

gulp.task('watch', [
    'watch:js',
    'watch:less',
    'watch:html',
    //'watch:docs'
]);

gulp.task('watch:js', function () {
    gulp.watch(paths.js, ['js']);
});

gulp.task('watch:less', function () {
    gulp.watch(paths.less, ['less']);
});

gulp.task('watch:html', function () {
    gulp.watch(paths.html, ['html']);
});
