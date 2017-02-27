'use strict';

fruskac.Kml = (function () {

    /**
     * KML
     * @param {string} url
     * @param {Object|undefined} options
     * @constructor
     */
    function Kml(url, options) {

        options = _.extend({
            map: gmap,
            preserveViewport: true,
            suppressInfoWindows: true,
            data: {
                type: 'kml'
            }
        }, options);

        return (function () {
            return new google.maps.KmlLayer(url, options)
        })();
    }

    return Kml;

})();