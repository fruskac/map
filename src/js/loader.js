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
        
        append: function (source, type) {
            return map.add(source, type, true)
        }

    };

    /**
     * Initialize layers
     *
     * @param {string|Object} source
     * @param {string} type
     * @param {boolean} visible
     */
    function load(source, type, visible) {

        if (typeof source === 'string') {
            source = {
                name: source,
                url: '../data/' + source + '.json'
            }
        }

        return storage.add({
            id: source.name,
            visible: visible,
            on: visible
        }).then(function () {
            return $.get(source.url).success(function (response) { // get json array of items

                var promises = [];

                response.forEach(function (item) {
                    var p, container = storage.get([source.name, item.tag]);

                    if (container) {
                        p = new Promise(function (resolve) {
                            resolve();
                        });
                    } else {
                        p = storage.add({
                            id: item.tag,
                            visible: visible,
                            on: visible,
                            type: type
                        }, source.name);
                    }

                    p.then(function () {
                        storage.add(item, [source.name, item.tag], type, visible);
                    });

                    promises.push(p);

                });

                return Promise.all(promises);

            })
        });
    }

    return Loader;

})();