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

        }

    };

    /**
     * Initialize layers
     *
     * @param {string} name
     * @param {string} type
     * @param {boolean} visible
     */
    function load(name, type, visible) {
        var resource = '../data/' + name + '.json';

        return storage.add({
            id: name,
            visible: visible,
            on: visible
        }).then(function () {
            return $.get(resource).success(function (response) { // get json array of items

                var promises = [];

                response.forEach(function (item) {
                    var container = storage.get([name, item.tag]);
                    var p;
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
                        }, name);
                    }
                    p.then(function () {
                        storage.add(item, [name, item.tag], type, visible);
                    });
                    promises.push(p);
                });

                return Promise.all(promises);

            })
        });
    }

    return Loader;

})();