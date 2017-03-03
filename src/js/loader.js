'use strict';

fruskac.Loader = (function () {

    /**
     * Loader
     *
     * @global
     * @constructor
     */
    function Loader() {}

    /**
     * @global
     */
    Loader.prototype = {

        /**
         * Initialize layers
         *
         * @param {string} name
         * @param {string} type
         * @param {boolean} visible
         */
        load: function (items, callback) {

            var promises = [];

            items.forEach(function (item) {
                promises.push(load.apply(this, item))
            });

            Promise.all(promises).then(function () {
                callback();
            });
        }

    };

    function load(name, type, visible) {
        var resource = '../data/' + name + '.json';

        return storage.add({
            id: name,
            visible: visible,
            on: visible
        }).then(function () {
            return $.get(resource).success(function (response) {
                var promises = [];
                response.forEach(function (item) {
                    var container = storage.get([name, item.tag]);
                    var p;
                    if (container) {
                        p = new Promise(function (resolve) {
                            resolve();
                        })
                    } else {
                        p = storage.add({
                            id: item.tag,
                            visible: visible,
                            on: visible,
                            type: type
                        }, name)
                    }
                    p.then(function () {
                        storage.add(item, [name, item.tag], type, visible);
                    });
                    promises.push(p);
                });
                Promise.all(promises).then(function (datas) {
                    return datas;
                });
            })
        });
    }

    return Loader;

})();