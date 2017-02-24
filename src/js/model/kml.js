/**
 *
 * @param {String} url
 * @param {Object|undefined} options
 * @constructor
 */
function Kml(url, options) {

  options = _.extend({
    map: MapService.getMap(),
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