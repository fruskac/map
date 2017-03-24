'use strict';

// expose API
window.fruskac = new fruskac.Api();

var util = new fruskac.Util();

fruskac.isCrossDomain = window.self !== window.top && document.referrer && !(new RegExp('//' + document.domain)).test(document.referrer);
fruskac.lang = util.getParameterByName('lang') || (window.self !== window.top && window.top.document.documentElement.lang) || CONFIG_LANG;

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

var latLngZoom = util.getParameterByName(PARAMETER_COORDINATES);
if (latLngZoom) {
    var parts = util.getParameterPartsByName(PARAMETER_COORDINATES);
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
    'img/overlay.png',
    overlayImageBounds,
    overlayOptions
);
groundOverlay.setMap(gmap);

var map = new fruskac.Map(gmap);

/*var clusterer = new MarkerClusterer(gmap, [], {
    maxZoom: 12,
    gridSize: 50,
    styles: [
        {
            textColor: 'white',
            url: 'img/sprite.png',
            backgroundPosition: '0 -523px',
            height: 32,
            width: 32
        },
        {
            textColor: 'white',
            url: 'img/sprite.png',
            backgroundPosition: '0 -443px',
            height: 48,
            width: 48
        },
        {
            textColor: 'white',
            url: 'img/sprite.png',
            backgroundPosition: '0 -379px',
            height: 64,
            width: 64
        }
    ]
});

clusterer.enabled = true;*/

var chart = new fruskac.Chart(document.getElementById('chart_container'));

/*
* URL param: "l" defines layers visible. If not defined, default visibility will be used
*/

// default layers and their visibility
var layers = CONFIG_LAYERS;

var activeLayers = [];

var layersFromUrl = util.getParameterPartsByName(PARAMETER_LAYERS);

layers.forEach(function (layer) {

    if (layersFromUrl) { // if layer URL param exists, layers' visibility should follow
        layer.visible = layersFromUrl.indexOf(layer.name) !== -1;
    }

    activeLayers.push(Object.values(layer));
});


/*
Load remote track
 */

var track = util.getParameterByName(PARAMETER_TRACK);

/*
Load from "activeLayers"
 */

var loader = new fruskac.Loader();

var focus = util.getParameterByName(PARAMETER_FOCUS);

loader.load(activeLayers).then(function () {

    if (track) {
        loader.append(track, TYPE_TRACK).then(function (object) {
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
