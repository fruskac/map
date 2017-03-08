'use strict';

var util = new fruskac.Util();

var storage = new fruskac.Storage();

var mapConfig = {
    center: new google.maps.LatLng(45.167031, 19.69677),
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    mapTypeControl: false,
    zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
    },
    streetViewControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
    }
};

var latLngZoom = util.getParameterByName('l');
if (latLngZoom) {
    var parts = util.getParameterPartsByName('l');
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

var map = new fruskac.Map(gmap);

var clusterer = new MarkerClusterer(gmap, [], {
    maxZoom: 13,
    gridSize: 50,
    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
});

clusterer.enabled = true;

var chart = new fruskac.Chart(document.getElementById('chart'));

var loader = new fruskac.Loader();

var focus = util.getParameterByName('f');

loader.load([
    ['locations', fruskac.TYPE.MARKER, true],
    ['marathon', fruskac.TYPE.TRACK, true],
    ['protection', fruskac.TYPE.KML, true],
    ['time', fruskac.TYPE.MARKER, true]
]).then(function () {
    if (focus) {
        google.maps.event.addListenerOnce(gmap, 'idle', function () { // wait for map to be loaded
            storage.focus(focus, true); // focus on selected object
        });
    }
});
