/**
 *
 * @param {string} url
 * @param {Object|undefined} options
 * @constructor
 */
function Kml(url, options) {

    options = _.extend({
        map: Map.getMap(),
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