'use strict';

(function (window, fruskac, TYPE) {

    var storage = fruskac.storage = new fruskac.Storage();

    var map = fruskac.map = new fruskac.Map(new google.maps.Map(document.getElementById('map'), {
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

    var clusterer = fruskac.clusterer = new MarkerClusterer(map.getMap(), [], {
        gridSize: 50,
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
    });

    clusterer.enabled = true;

    fruskac.chart = new fruskac.Chart(document.getElementById('chart'));

    load('locations', TYPE.MARKER, true);
    load('marathon', TYPE.TRACK, true);
    load('protection', TYPE.KML, true);
    load('time', TYPE.MARKER, true);

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
            return storage.getSelectors();
        },
        /**
         *
         * Get / Set clustering state
         * @param {undefined|boolean} value
         * @returns {*|boolean}
         */
        clustering: function (value) {
            if (value === undefined) { // act as getter
                return clusterer.enabled;
            } else { // act as setter
                clusterer.enabled = value;
                if (value) {
                    clusterer.setMaxZoom(null);
                    clusterer.setGridSize(50);
                } else {
                    clusterer.setMaxZoom(1);
                    clusterer.setGridSize(1);
                }
                clusterer.resetViewport();
                clusterer.redraw();
            }
        },
        /**
         * Get / Set map type
         * @param {undefined|string} value
         * @returns {*}
         */
        type: function (value) {
            if (value === undefined) { // act as getter
                return map.getMap().getMapTypeId();
            } else { // act as setter
                return map.getMap().setMapTypeId(value);
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

})(window, window.fruskac, window.fruskac.TYPE);