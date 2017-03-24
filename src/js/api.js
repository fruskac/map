'use strict';

fruskac.Api = (function () {

    function Api(){}

    Api.prototype = {

        /**
         * Fired when ready
         * @global
         * @param {Function} callback
         */
        ready: function (callback) {
            callback();
        },

        /**
         * Get data
         * @global
         * @returns {Object[]}
         */
        getData: function () {
            return storage.getSelectors();
        },

        /**
         * Get / Set clustering state
         * @global
         * @param {undefined|boolean} value
         * @returns {*|boolean}
         */
        clustering: function (value) {
            if (value === undefined) { // act as getter
                //return clusterer.enabled;
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
         * @global
         * @param {undefined|string} value
         * @returns {*}
         */
        type: function (value) {
            if (value === undefined) { // act as getter
                return gmap.getMapTypeId();
            } else { // act as setter
                return gmap.setMapTypeId(value);
            }
        }
    };

    return Api;

})();