fruskac.Event = (function () {
  const cache = {};

  /**
   * Event
   * @global
   * @constructor
   */
  function Event() {
  }

  /**
   * @global
   */
  Event.prototype = {

    /**
     * Publish on channel
     * @param {string} name
     * @param args
     */
    publish(name, args) {
      try {
        cache[name] && cache[name].forEach((callback) => {
          callback.apply(args);
        });
      } catch (err) {
        console.warn(err);
      }
    },

    /**
     * Subscribe a callback on a channel
     * @param {string|Array} name
     * @param {Function} callback
     * @returns {Array}
     */
    subscribe(name, callback) {
      const self = this;

      if (name.constructor === Array) {
        name.forEach((n) => {
          self.subscribe(n, callback);
        });
        return;
      }

      if (!cache[name]) {
        cache[name] = [];
      }
      cache[name].push(callback);
      return [name, callback];
    },

    /**
     * Unsubscribe
     * @param handle
     */
    unsubscribe(handle) {
      const name = handle[0];
      cache[name] && cache[name].forEach(function (id) {
        if (this == handle[1]) {
          cache[name].splice(id, 1);
        }
      });
    },

  };

  return Event;
}());
