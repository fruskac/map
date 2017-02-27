'use strict';

window.fruskac = (function () {
    return new fruskac();
})();

var Storage = new StorageService();

var Map = new MapService(new google.maps.Map(document.getElementById('map'), {
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
}));

var Clusterer = new MarkerClusterer(Map.getMap(), [], {
    gridSize: 50,
    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
});

Clusterer.enabled = true;

var ChartService = new ChartService(document.getElementById('chart'));

load('locations', fruskac.TYPE.MARKER, true);
load('marathon', fruskac.TYPE.TRACK, true);
load('protection', fruskac.TYPE.KML, true);
load('time', fruskac.TYPE.MARKER, true);

window.FruskacMap = {
    /**
     * Fired when ready
     * @param {Function} callback
     */
    ready: function (callback) {
        callback();
    },
    /**
     * Get data
     * @returns {Object[]}
     */
    getData: function () {
        return Storage.getSelectors();
    },
    /**
     *
     * Get / Set clustering state
     * @param {undefined|boolean} value
     * @returns {*|boolean}
     */
    clustering: function (value) {
        if (value === undefined) { // act as getter
            return Clusterer.enabled;
        } else { // act as setter
            Clusterer.enabled = value;
            if (value) {
                Clusterer.setMaxZoom(null);
                Clusterer.setGridSize(50);
            } else {
                Clusterer.setMaxZoom(1);
                Clusterer.setGridSize(1);
            }
            Clusterer.resetViewport();
            Clusterer.redraw();
        }
    },
    /**
     * Get / Set map type
     * @param {undefined|string} value
     * @returns {*}
     */
    type: function (value) {
        if (value === undefined) { // act as getter
            return Map.getMap().getMapTypeId();
        } else { // act as setter
            return Map.getMap().setMapTypeId(value);
        }
    }
};

/**
 * Initialize layers
 * @param {string} name
 * @param {string} type
 * @param {boolean} visible
 */
function load(name, type, visible) {

    var resource = '../data/' + name + '.json';

    Storage.add({
        id: name,
        visible: visible,
        on: visible
    }).then(function () {
        $.get(resource).success(function (response) {
            response.forEach(function (item) {
                var container = Storage.get([name, item.tag]);
                var promise;
                if (container) {
                    promise = new Promise(function (resolve) {
                        resolve();
                    })
                } else {
                    promise = Storage.add({
                        id: item.tag,
                        visible: visible,
                        on: visible,
                        type: type
                    }, name)
                }
                promise.then(function () {
                    Storage.add(item, [name, item.tag], type, visible);
                });
            })
        })
    });

}
