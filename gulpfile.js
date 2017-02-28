var gulp = require('gulp');
var less = require('gulp-less');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
var clean = require('gulp-clean');
var doxx = require('gulp-doxx');
var replace = require('gulp-replace');

var paths = {};

gulp.task('default', [
    'less',
    'js',
    'html',
    'docs'
], function () {
});

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
    'src/js/const/*.js',
    'src/js/extend/googleMaps.js',
    'src/js/model/marker.js',
    'src/js/model/track.js',
    'src/js/model/kml.js',
    'src/js/service/chart.js',
    'src/js/service/map.js',
    'src/js/service/storage.js',
    'src/js/loader.js',
    'src/js/init.js',
    'src/js/api.js'
];

gulp.task('js', function () {
    return gulp.src(paths.js)
        .pipe(concat('map.min.js'))
        .pipe(uglify({
            mangle: true,
            compress: true
        }))
        .pipe(replace(/'use strict';/g, ''))
        .pipe(gulp.dest('./dist'));
});

gulp.task('html', function () {
    return gulp.src('./src/index.html')
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
        ], { read: false })
        .pipe(clean());
});

gulp.task('docs', [
    'docs:clean'
], function () {
    gulp.src([
        './README.md',
        './src/**/*.js'
    ], { base: '.' })
        .pipe(doxx({
            title: 'Fruškać Map',
            urlPrefix: '/map'
        }))
        .pipe(gulp.dest('docs'));
});

gulp.task('watch', [
    'watch:js',
    //'watch:less',
    //'watch:html',
    //'watch:docs'
]);

gulp.task('watch:js', function() {
    gulp.watch(paths.js, ['js']);
});
