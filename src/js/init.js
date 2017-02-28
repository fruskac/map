'use strict';

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
    gridSize: 50,
    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
});

clusterer.enabled = true;

var chart = new fruskac.Chart(document.getElementById('chart'));

load('locations', fruskac.TYPE.MARKER, true);
load('marathon', fruskac.TYPE.TRACK, true);
load('protection', fruskac.TYPE.KML, true);
load('time', fruskac.TYPE.MARKER, true);


/**
 * Initialize layers
 * @global
 * @param {string} name
 * @param {string} type
 * @param {boolean} visible
 */
function load(name, type, visible) {

    var resource = '../data/' + name + '.json';

    storage.add({
        id: name,
        visible: visible,
        on: visible
    }).then(function () {
        $.get(resource).success(function (response) {
            response.forEach(function (item) {
                var container = storage.get([name, item.tag]);
                var promise;
                if (container) {
                    promise = new Promise(function (resolve) {
                        resolve();
                    })
                } else {
                    promise = storage.add({
                        id: item.tag,
                        visible: visible,
                        on: visible,
                        type: type
                    }, name)
                }
                promise.then(function () {
                    storage.add(item, [name, item.tag], type, visible);
                });
            })
        })
    });

}
