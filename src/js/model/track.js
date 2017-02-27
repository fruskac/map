'use strict';

(function (fruskac) {

    /**
     * Track
     *
     * @param {Object|undefined} options
     * @constructor
     */
    var Track = function (options) {

        options = _.extend({
            map: Map.getMap(),
            geodesic: true,
            strokeColor: 'rgb(51, 102, 204)',
            strokeOpacity: 1.0,
            strokeWeight: 4
        }, options);

        return (function () {
            return new google.maps.Polyline(options)
        })();
    };

    fruskac.Track = Track;

})(fruskac);