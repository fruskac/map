/**
 * MapService
 *
 * @param map
 * @constructor
 */
var MapService = function (map) {
  this.map = map;

  this.infoWindow = new google.maps.InfoWindow({
    content: "holding..."
  });

};

MapService.prototype = {

  /**
   * Add item to map
   *
   * @param data
   * @param type
   * @param visible
   * @returns {Promise}
   */
  add: function (data, type, visible) {

    var self = this;

    return new Promise(function (resolve) {
      switch (type) {
        case TYPES.MARKER:
          return self.addMarker(data, visible).then(function (marker) {
            resolve(marker);
          });
          break;
        case TYPES.TRACK:
          return self.addTrack(data, visible).then(function (track) {
            resolve(track);
          });
          break;
        case TYPES.KML:
          return self.addKml(data, visible).then(function (kml) {
            resolve(kml);
          });
          break;
      }
    });

  },

  /**
   * Add marker to map
   *
   * @param data
   * @param visible
   * @returns {Promise}
   */
  addMarker: function (data, visible) {

    return new Promise(function (resolve) {
      var marker = new Marker({
        position: new google.maps.LatLng(data.lat, data.lng),
        title: data.data.title,
        icon: data.tag,
        data: data.data
      });

      marker.setVisible(visible);

      resolve(marker);

    })

  },

  /**
   * Add track to map
   *
   * @param data
   * @param visible
   * @returns {Promise}
   */
  addTrack: function (data, visible) {

    return new Promise(function (resolve) {

      return $.get('../' + data.url).then(function (response) {
        var points = [];
        $(response).find('trkpt').each(function (i, v) {
          var lat = Number($(this).attr('lat'));
          var lon = Number($(this).attr('lon'));
          var p = new google.maps.LatLng(lat, lon);
          points.push(p);
        });

        var track = new Track({
          path: points
        });

        track.setVisible(visible);

        resolve(track);

      });

    });

  },

  /**
   * Add KML layer to map
   *
   * @param data
   * @param visible
   * @returns {Promise}
   */
  addKml: function (data, visible) {

    return new Promise(function (resolve) {

      var kml = new Kml(data.url);

      if (!visible) {
        kml.setMap(null);
      }

      resolve(kml);

    })

  },

  /**
   *
   * @param object
   * @param value
   */
  setVisible: function (object, value) {
    if (object.hasOwnProperty('position')) {
      object.setVisible(value);
    } else if (object.hasOwnProperty('strokeColor')) {
      object.setVisible(value);
    } else if (object.hasOwnProperty('suppressInfoWindows')) {
      object.setMap(value ? this.map : null);
    }
  },

  /**
   * Get map
   *
   * @returns {*}
   */
  getMap: function () {
    return this.map;
  },

  /**
   * Focus one object on map, fit bounds
   * @param object
   */
  focus: function (object) {
    this.map.fitBounds(object.getBounds());
    ChartService.show(object.getPath())
  },

  /**
   * Place marker on map
   *
   * @param point
   */
  placeMarker: function (point) {
    if (!this.marker) {
      this.marker = new Marker({
        position: point
      });
    } else {
      this.marker.animateTo(point, {
        duration: 50
      });
    }
  },

  /**
   * Show info window
   *
   * @param html
   * @param marker
   */
  showInfoWindow: function (html, marker) {
    this.infoWindow.setContent(html);
    this.infoWindow.open(this.map, marker)
  }
};
