fruskac.Track = (function () {
  /**
   * Track
   * @global
   * @param {Object|undefined} options
   * @constructor
   */
  function Track(options) {
    options = util.extend({
      map: gmap,
      geodesic: true,
      strokeColor: options.color || '#d2003b',
      strokeOpacity: 1.0,
      strokeWeight: 4,
    }, options);

    return (function () {
      return new google.maps.Polyline(options);
    }());
  }

  return Track;
}());
