'use strict';

var util = new fruskac.Util();

var storage = new fruskac.Storage();

var gmap = new google.maps.Map(document.getElementById('map'), {
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
});

var map = new fruskac.Map(gmap);

var clusterer = new MarkerClusterer(gmap, [], {
    maxZoom: 13,
    gridSize: 50,
    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
});

clusterer.enabled = true;

var chart = new fruskac.Chart(document.getElementById('chart'));

var loader = new fruskac.Loader();

var selector = util.getParameterByName('l');

loader.load([
    ['locations', fruskac.TYPE.MARKER, true],
    ['marathon', fruskac.TYPE.TRACK, true],
    ['protection', fruskac.TYPE.KML, true],
    ['time', fruskac.TYPE.MARKER, true]
]).then(function () {
    if (selector) {
        google.maps.event.addListenerOnce(gmap, 'idle', function () { // wait for map to be loaded
            storage.focus(selector, true); // focus on selected object
        });
    }
});
