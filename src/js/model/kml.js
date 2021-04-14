fruskac.Kml = (function () {
  /**
   * KML
   * @global
   * @param {string} url
   * @param {Object|undefined} options
   * @constructor
   */
  function Kml(url, options) {
    options = util.extend({
      map: gmap,
      preserveViewport: true,
      suppressInfoWindows: true,
      data: {
        type: 'kml',
      },
    }, options);

    return (function () {
      return new google.maps.KmlLayer(url, options);
    }());
  }

  return Kml;
}());
