fruskac.Api = (function () {
  /**
   * Api
   * @global
   * @param {Object|undefined} options
   * @constructor
   */
  function Api(options) {
    fruskac.config = util.extend({
      lang: 'en',
      fullscreen: window.location,
      data: [],
      map: {
        center: {
          latitude: 45.1570741,
          longitude: 19.7093099,
        },
        zoom: 12,
      },
    }, options);

    fruskac.init();
  }

  /**
   * @global
   */
  Api.prototype = {

    /**
     * Fired when ready
     * @param {Function} callback
     */
    ready(callback) {
      const self = this;
      event.subscribe('ready', () => {
        callback.apply(self);
      });
      return this;
    },

    move(callback) {
      const self = this;
      event.subscribe('move', (...args) => {
        callback.apply(self, args);
      });
      return this;
    },

    /**
     * Get data
     * @returns {Object[]}
     */
    getData() {
      return storage.getSelectors();
    },

    /**
     * Get / Set map type
     * @param {undefined|string} value
     * @returns {*}
     */
    type(value) {
      if (value === undefined) { // act as getter
        return gmap.getMapTypeId();
      } // act as setter
      return gmap.setMapTypeId(value);
    },

    locate() {
      geolocation.locate();
    },
  };

  return Api;
}());
