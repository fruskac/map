'use strict';

// expose API
window.fruskac = new fruskac.Api();

var util = new fruskac.Util();

fruskac.isCrossDomain = window.self !== window.top && document.referrer && !(new RegExp('//' + document.domain)).test(document.referrer);
fruskac.lang = util.getParameterByName('lang') || (window.self !== window.top && window.top.document.documentElement.lang) || 'en';

var i18n  = new fruskac.I18n(fruskac.lang);

var storage = new fruskac.Storage();

var mapConfig = {
    center: new google.maps.LatLng(45.167031, 19.69677),
    zoom: 11,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    mapTypeControl: false,
    zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
    },
    streetViewControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
    }
};

var latLngZoom = util.getParameterByName(fruskac.PARAMETER.COORDINATES);
if (latLngZoom) {
    var parts = util.getParameterPartsByName(fruskac.PARAMETER.COORDINATES);
    if (parts && parts.length) {
        if (parts[0] && parts[1]) {
            mapConfig.center = new google.maps.LatLng(parts[0], parts[1]);
        }
        if (parts[2]) {
            mapConfig.zoom = parseFloat(parts[2]);
        }
    }
}

var gmap = new google.maps.Map(document.getElementById('map'), mapConfig);

var overlayImageBounds = {
    north: 45.166508,
    south: 45.136001,
    east: 19.767672,
    west: 19.681498
};
var overlayOptions = {
    opacity: 0.8,
    clickable: false
};
var groundOverlay = new google.maps.GroundOverlay(
    'http://fruskac.net/sites/all/themes/fruskac/css/img/fruskac-logo-map.png',
    overlayImageBounds,
    overlayOptions
);
groundOverlay.setMap(gmap);

var map = new fruskac.Map(gmap);

var clusterer = new MarkerClusterer(gmap, [], {
    maxZoom: 12,
    gridSize: 50,
    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
});

clusterer.enabled = true;

var chart = new fruskac.Chart(document.getElementById('chart_container'));

/*
* URL param: "l" defines layers visible. If not defined, default visibility will be used
*/

// default layers and their visibility
var layers = [
    {
        source: 'locations-' + fruskac.lang,
        type: fruskac.TYPE.MARKER,
        visible: true
    },
    {
        source: 'marathon',
        type: fruskac.TYPE.TRACK,
        visible: false
    },
    {
        source: 'protection',
        type: fruskac.TYPE.KML,
        visible: false
    },
    {
        source: 'time',
        type: fruskac.TYPE.MARKER,
        visible: false
    }
];

var activeLayers = [];

var layersFromUrl = util.getParameterPartsByName(fruskac.PARAMETER.LAYERS);

layers.forEach(function (layer) {

    if (layersFromUrl) { // if layer URL param exists, layers' visibility should follow
        layer.visible = layersFromUrl.indexOf(layer.name) !== -1;
    }

    activeLayers.push(Object.values(layer));
});


/*
Load remote track
 */

var track = util.getParameterByName(fruskac.PARAMETER.TRACK);

/*
Load from "activeLayers"
 */

var loader = new fruskac.Loader();

var focus = util.getParameterByName(fruskac.PARAMETER.FOCUS);

loader.load(activeLayers).then(function () {

    if (track) {
        loader.append(track, fruskac.TYPE.TRACK).then(function (object) {
            google.maps.event.addListenerOnce(gmap, 'idle', function () { // wait for map to be loaded
                map.focus(object); // focus on appended object
            });
        })
    }

    if (focus) {
        google.maps.event.addListenerOnce(gmap, 'idle', function () { // wait for map to be loaded
            storage.focus(focus, true); // focus on selected object
        });
    }
});
