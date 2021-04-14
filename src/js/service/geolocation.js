fruskac.Geolocation = (function () {
  /**
   * @global
   * @param {Array} Initial data array
   * @constructor
   */
  function Geolocation() {
    const self = this;

    let enabled;
    let interval;

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      self.marker = new google.maps.Marker({
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#d2003b',
          fillOpacity: 1.0,
          strokeColor: '#d2003b',
          strokeOpacity: 0.5,
          strokeWeight: 3,
          scale: 6,
        },
      });

      self.marker.setMap(gmap);

      update();

      interval = setInterval(() => {
        update();
      }, 5000);
    } else {
      console.warn('Browser doesn\'t support Geolocation');
    }

    /**
     * Get user's location
     */
    function update() {
      navigator.geolocation.getCurrentPosition((position) => {
        const LatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        self.marker.setPosition(LatLng);

        if (!enabled) {
          util.show(document.getElementById('map_button_locate'));
          enabled = true;
        }
      }, () => {
        console.warn('Browser location not available');
        clearInterval(interval);
      });
    }
  }

  /**
   * @global
   */
  Geolocation.prototype = {

    /**
     * Center map on user's location
     */
    locate() {
      gmap.setCenter(this.marker.position);
      gmap.setZoom(16);
    },

  };

  window.locate = function () {
    geolocation.locate();
  };

  return Geolocation;
}());
