'use strict';

fruskac.Event = (function () {

    var cache = {};

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
        publish: function (name, args) {
            try {
                cache[name] && cache[name].forEach(function (callback) {
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
        subscribe: function (name, callback) {

            var self = this;

            if (name.constructor === Array) {
                name.forEach(function (n) {
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
        unsubscribe: function (handle) {
            var name = handle[0];
            cache[name] && cache[name].forEach(function (id) {
                if (this == handle[1]) {
                    cache[name].splice(id, 1);
                }
            });
        }

    };

    return Event;

})();