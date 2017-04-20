'use strict';

fruskac.Loader = (function () {

    /**
     * Loader
     *
     * @global
     * @constructor
     */
    function Loader() {
    }

    /**
     * @global
     */
    Loader.prototype = {


        /**
         * Load items
         *
         * @param {Array} items
         */
        load: function (items) {

            var promises = [];

            items.forEach(function (item) {
                promises.push(load.apply(this, item));
            });

            return Promise.all(promises);

        },

        /**
         * Append item to map
         *
         * @param url
         * @param type
         */
        append: function (url, type) {
            return map.add(url, type, true)
        }

    };

    return Loader;

    /**
     * Initialize layers
     *
     * @param {string} url
     * @param {string} name
     * @param {string} type
     * @param {object} options
     */
    function load(url, name, type, options) {

        options = _.extend({
            visible: false,
            show: [],
            hide: []
        }, options);

        return storage.add({
            id: name.toLowerCase(),
            visible: options.visible,
            on: options.visible
        }).then(function () {
            return $.get(url).success(function (response) { // get json array of items

                var promises = [];

                response.forEach(function (item) {
                    var p, container = storage.get([name, item.tag]);

                    var v = (function () {

                        if (options.show.length) { // whitelist
                            return options.show.indexOf(item.tag) !== -1;
                        }

                        if (options.hide.length) { // blacklist
                            return options.show.indexOf(item.tag) === -1;
                        }

                        return options.visible;

                    })();

                    if (container) {
                        // dummy promise to allow promise chain
                        p = new Promise(function (resolve) {
                            resolve();
                        });
                    } else {
                        // create subcategory
                        p = storage.add({
                            id: item.tag.toLowerCase(),
                            visible: v,
                            on: v,
                            type: type
                        }, name);
                    }

                    p.then(function () {
                        // when subcategory is created, add map item to storage
                        storage.add(item, [name.toLowerCase(), item.tag], type, v);
                    });

                    promises.push(p);

                });

                return Promise.all(promises);

            })
        });
    }

    function isVisible(name, defaultValue) {

        if (!name) {
            return;
        }

        /*if (fruskac.config.show.indexOf(name) !== -1) {
            return true;
        }

        if (fruskac.config.hide.indexOf(name) !== -1) {
            return false;
        }*/

        return defaultValue;

    }

})();