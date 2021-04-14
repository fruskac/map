fruskac.Map = (function () {
  const style = {};
  const sheet = (function () {
    const style = document.createElement('style');
    style.appendChild(document.createTextNode(''));
    document.head.appendChild(style);

    return style.sheet;
  }());

  /**
   * Map
   * @global
   * @constructor
   */
  function Map() {
    // show fullscreen button if CrossDomain or if "allowfullscreen" attribute added to iframe
    if (fruskac.isCrossDomain || fruskac.allowfullscreen) {
      util.show(document.getElementById('map_button_fullscreen'));
    }
  }

  /**
   * @global
   */
  Map.prototype = {

    /**
     * Add object to map
     * @param {Object} data
     * @param {string} type
     * @param {boolean} visible
     * @param {string|object} color
     * @returns {Promise}
     */
    add(data, type, visible, color) {
      const self = this;

      return new Promise((resolve) => {
        switch (type) {
          case TYPE_MARKER:
            return self.addMarker(data, visible, color).then((marker) => {
              resolve(marker);
            });
            break;
          case TYPE_TRACK:
            return self.addTrack(data, visible, color).then((track) => {
              resolve(track);
            });
            break;
          case TYPE_KML:
            return self.addKml(data, visible, color).then((kml) => {
              resolve(kml);
            });
            break;
        }
      });
    },

    /**
     * Add marker to map
     * @param {Object} data
     * @param {boolean} visible
     * @param {string|object} color
     * @returns {Promise}
     */
    addMarker(data, visible, color) {
      return new Promise((resolve) => {
        const marker = new fruskac.Marker({
          position: new google.maps.LatLng(data.lat, data.lng),
          title: data.data.title,
          icon: data.tag,
          data: data.data,
          visible,
        });

        if (color) {
          if (typeof color === 'string') {
            applyStyle(`.marker-${data.tag}:before`, 'background-color', color);
          } else {
            Object.keys(color).forEach((key) => {
              applyStyle(`.marker-${key}:before`, 'background-color', color[key]);
            });
          }
        }

        google.maps.event.addListener(marker, 'click', () => {
          marker.animateWobble();
        });

        resolve(marker);
      });
    },

    /**
     * Add track to map
     * @param {Object} data
     * @param {boolean} visible
     * @param {string|object} color
     * @returns {Promise}
     */
    addTrack(data, visible, color) {
      let url;

      if (typeof data === 'string') {
        url = data;
      } else {
        url = data.url;
      }

      if (color) {
        if (typeof color === 'object') {
          color = color[data.tag];
        }
      }

      return new Promise((resolve) => {
        const request = new XMLHttpRequest();

        request.open('GET', url, true);

        request.onload = function () {
          if (request.status >= 200 && request.status < 400) {
            const points = [];
            const regex = new RegExp('<trkpt lat="([^"]+)" lon="([^"]+)">', 'g');
            let match;

            while (match = regex.exec(request.responseText)) {
              points.push(new google.maps.LatLng(match[1], match[2]));
            }

            const track = new fruskac.Track({
              path: points,
              color,
            });

            track.setVisible(visible);

            resolve(track);
          }
        };

        request.send();
      });
    },

    /**
     * Add KML layer to map
     * @param {Object} data
     * @param {boolean} visible
     * @param {string|object} color
     * @returns {Promise}
     */
    addKml(data, visible, color) {
      return new Promise((resolve) => {
        const kml = new fruskac.Kml(data.url);

        if (!visible) {
          kml.setMap(null);
        }

        resolve(kml);
      });
    },

    /**
     * Set visibility on object
     * @param {Object} object
     * @param {boolean} value
     */
    setVisible(object, value) {
      switch (getType(object)) {
        case TYPE_MARKER:
          object.setVisible(value);
          break;
        case TYPE_TRACK:
          object.setVisible(value);
          break;
        case TYPE_KML:
          object.setMap(value ? gmap : null);
          break;
      }
    },

    /**
     * Focus one object on map, fit bounds
     * @param {Object} object
     */
    focus(object, isFixedLayout) {
      const self = this;

      switch (getType(object)) {
        case TYPE_MARKER:
          gmap.setZoom(14);
          gmap.panTo(object.position);
          var interval = setInterval(() => {
            object.animateBounce();
          }, 2000);
          setTimeout(() => {
            object.div.addEventListener('click', () => {
              clearInterval(interval);
            });
          }, 2000);
          break;
        case TYPE_TRACK:
          self.placeMarker(null);
          gmap.fitBounds(object.getBounds());
          chart.show(object.getPath(), isFixedLayout);
          break;
      }
    },

    /**
     * Place marker on map
     * @param {google.maps.LatLng} point
     * @param {string|undefined} icon
     * @param {boolean|undefined} pulsate
     */
    placeMarker(point, icon, pulsate) {
      const self = this;

      if (point) {
        if (self.hasOwnProperty('marker')) {
          self.marker.setPoint(point);
        } else {
          self.marker = new fruskac.Marker({
            position: point,
            visible: true,
            pulsate,
            icon,
          });
        }

        if (!gmap.getBounds().contains(point)) {
          gmap.panTo(point);
        }
      } else if (self.hasOwnProperty('marker')) {
        self.marker.remove();
        delete self.marker;
      }
    },

    /**
     * Open a new window using URL parameters from current map
     */
    fullscreen() {
      const params = {
        c: `${gmap.getCenter().lat()},${gmap.getCenter().lng()},${gmap.getZoom()}`,
        f: request.get(PARAMETER_FOCUS),
        t: request.get(PARAMETER_TRACK),
      };

      const url = `${fruskac.config.fullscreen}?${Object.keys(params).map((i) => params[i] && `${encodeURIComponent(i)}=${encodeURIComponent(params[i])}`).join('&')}`;

      window.open(url, '_blank');
    },
  };

  /**
   * Get type of object
   * @param {object} object
   */
  function getType(object) {
    if (!object) {
      return;
    }
    if (object.hasOwnProperty('position')) { // marker
      return TYPE_MARKER;
    }
    if (object.hasOwnProperty('strokeColor')) {
      return TYPE_TRACK;
    }
    if (object.hasOwnProperty('suppressInfoWindows')) {
      return TYPE_KML;
    }
  }

  function applyStyle(name, property, value) {
    if (style[name] === undefined) {
      style[name] = {};
    }

    if (style[name][property] === undefined) {
      style[name][property] = value;
      sheet.insertRule(`${name}{${property}:${value}}`, 0);
    }
  }

  window.fullscreen = function () {
    map.fullscreen();
  };

  return Map;
}());
