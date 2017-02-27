'use strict';

/**
 * @global
 */
window.api = {

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
            return gmap.getMapTypeId();
        } else { // act as setter
            return gmap.setMapTypeId(value);
        }
    }
};
