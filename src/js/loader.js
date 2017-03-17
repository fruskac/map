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

    /**
     * Initialize layers
     *
     * @param {string} url
     * @param {string} name
     * @param {string} type
     * @param {boolean} visible
     */
    function load(url, name, type, visible) {

        return storage.add({
            id: name.toLowerCase(),
            visible: visible,
            on: visible
        }).then(function () {
            return $.get(url).success(function (response) { // get json array of items

                var promises = [];

                response.forEach(function (item) {
                    var p, container = storage.get([name, item.tag]);

                    if (container) {
                        p = new Promise(function (resolve) {
                            resolve();
                        });
                    } else {
                        p = storage.add({
                            id: item.tag.toLowerCase(),
                            visible: visible,
                            on: visible,
                            type: type
                        }, name);
                    }

                    p.then(function () {
                        storage.add(item, [name.toLowerCase(), item.tag], type, visible);
                    });

                    promises.push(p);

                });

                return Promise.all(promises);

            })
        });
    }

    return Loader;

})();