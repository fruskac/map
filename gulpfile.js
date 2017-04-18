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
var iife = require('gulp-iife');
var inlinesource = require('gulp-inline-source');
var imagemin = require('gulp-imagemin');
var base64 = require('gulp-base64');
var svgstore = require('gulp-svgstore');
var inject = require('gulp-inject');
var rename = require('gulp-rename');

var paths = {};

var gaConfig = {
    url: 'auto',
    uid: 'UA-52141130-3',
    sendPageView: true
};

gulp.task('default', function () {
    return runSequence(
        'build'
        , 'inlinesource'
        //,'docs'
    );
});

gulp.task('build', [
    'build:less'
    , 'build:js'
    , 'build:img'
    , 'build:html'
]);

gulp.task('inlinesource', function () {
    return runSequence(
        'inlinesource:html'
        , 'inlinesource:clean'
    );
});

gulp.task('inlinesource:html', function () {

    var index = 0,
        alphabet = 'abcdefghijklmnopqrstuvwxyz'.split(''),
        map = {};

    function getValue(string, namespace) {
        var name = namespace + '__' + string;
        var value = map[name];
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
        .pipe(replace(/(#|id="|getElementById\(")([a-z_]{7,}|chart|map)/g, function (match, value_1, value_2) {
            return value_1 + getValue(value_2, 'id');
        }))
        // class selectors
        // TODO: minify class selectors
        /*.pipe(replace(/([},]\.|class="|getElementsByClassName\("|Class\(\w+\.div,")([a-z]{6,})/g, function (match, value_1, value_2) {
            return value_1 + getValue(value_2, 'class');
        }))*/
        // misc
        // TODO: minify other selectors
        /*.pipe(replace(/(\[|\s)(marker)(\]|\s)/g, function (match, value_1, value_2, value_3) {
            return value_1 + getValue(value_2, 'misc') + value_3;
        }))*/
        // methods
        // TODO: minify JS methods
        /*.pipe(replace(/(getParameterByName|getParameterPartsByName|I18N|placeMarker|addMarker|Marker|addTrack|Track|addKml|Kml|Loader|Chart|markerWrap|markerShadow|animateWobble|animateBounce|animateDrop|setOpaque|showInfoWindow|highlight|translate|fromLatLngToDivPixel)/g, function (match, value_1) {
            return getValue(value_1, 'method');
        }))*/
        .pipe(replace("\n", ' '))
        .pipe(replace(/[\s]+/g, ' '))
        .pipe(gulp.dest('./dist'));
});

gulp.task('inlinesource:clean', function () {
    return gulp.src([
        './dist/map.min.*'
        , './dist/img'
    ], {read: false})
        .pipe(clean());
});

paths.less = [
    './src/less/*.less'
];

gulp.task('build:less', function () {
    return gulp.src(paths.less)
        .pipe(less())
        .pipe(cssnano())
        .pipe(concat('map.min.css'))
        .pipe(gulp.dest('./dist'));
});

paths.js = [
    'bower_components/google-maps-v3-infobox/infobox.js',
    'src/js/bootstrap.js'
    , 'src/js/util.js'
    , 'src/js/const/*.js'
    , 'src/js/extend/googleMaps.js'
    , 'map.config.js'
    , 'src/js/model/marker.js'
    , 'src/js/model/track.js'
    , 'src/js/model/kml.js'
    , 'src/js/service/i18n.js'
    , 'src/js/service/chart.js'
    , 'src/js/service/map.js'
    , 'src/js/service/storage.js'
    , 'src/js/service/dialog.js'
    , 'src/js/service/event.js'
    , 'src/js/loader.js'
    , 'src/js/api.js'
    , 'src/js/init.js'
];

gulp.task('build:js', function () {
    return gulp.src(paths.js)
        .pipe(concat('map.min.js'))
        .pipe(replace(/["']use strict["'];/g, ''))
        .pipe(iife({
            params: ['window', 'document', '$', '_', 'google', 'Promise', 'dynamics'],
            args: ['window', 'document', 'jQuery', '_', 'google', 'Promise', 'dynamics']
        }))
        .pipe(uglify({
            mangle: true
        }))
        .pipe(gulp.dest('./dist'));
});

paths.html = [
    './src/index.html'
];

gulp.task('build:img', function () {
    return gulp.src('src/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/img'))
});

gulp.task('build:html', function () {

    var svgs = gulp.src('./src/img/icon/*.svg')
        .pipe(rename({prefix: 'icon-'}))
        .pipe(svgstore({inlineSvg: true}));

    function fileContents(filePath, file) {
        return file.contents.toString();
    }

    return gulp
        .src(paths.html)
        .pipe(inject(svgs, {transform: fileContents}))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyJS: true
        }))
        .pipe(gulp.dest('./dist'));

});

gulp.task('docs:clean', function () {
    return gulp.src([
        'docs/*'
    ], {read: false})
        .pipe(clean());
});

gulp.task('docs:copy:dist', function () {
    return gulp
        .src([
            'dist/*'
            , 'dist/**/*'
        ])
        .pipe(gulp.dest('docs/dist'));
});

gulp.task('docs:copy:data', function () {
    return gulp
        .src([
            'data/*'
            , 'data/**/*'
        ])
        .pipe(gulp.dest('docs/data'));
});

gulp.task('docs:copy:examples', function () {
    return gulp
        .src([
            'examples/**/*'
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
    'docs:copy:dist'
    , 'docs:copy:data'
    , 'docs:copy:examples'
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

gulp.task('watch', function () {
    return runSequence(
        'build',
        [
            'watch:js'
            , 'watch:less'
            , 'watch:html'
            //,'watch:docs'
        ]
    )
});

gulp.task('watch:js', function () {
    gulp.watch(paths.js, ['build:js']);
});

gulp.task('watch:less', function () {
    gulp.watch(paths.less, ['build:less']);
});

gulp.task('watch:html', function () {
    gulp.watch(paths.html, ['build:html']);
});
