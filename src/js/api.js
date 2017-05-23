'use strict';

fruskac.Api = (function () {

    /**
     * Api
     * @global
     * @param {Object|undefined} options
     * @constructor
     */
    function Api(options) {

        fruskac.config = util.extend({
            lang: 'en',
            fullscreen: window.location,
            data: []
        }, options);

        fruskac.init();

    }

    /**
     * @global
     */
    Api.prototype = {

        /**
         * Fired when ready
         * @param {Function} callback
         */
        ready: function (callback) {
            var self = this;
            event.subscribe('ready', function () {
                callback.apply(self);
            });
        },

        /**
         * Get data
         * @returns {Object[]}
         */
        getData: function () {
            return storage.getSelectors();
        },

        /**
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
                    clusterer.setMaxZoom(12);
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
                return gmap.getMapTypeId();
            } else { // act as setter
                return gmap.setMapTypeId(value);
            }
        }
    };

    return Api;

})();