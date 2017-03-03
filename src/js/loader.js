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

            items.forEach(function (item) {
                load.apply(this, item)
            });

            // TODO: create promise instead of timeout
            setTimeout(function () {
                callback();
            }, 3000);
        }

    };

    function load(name, type, visible) {
        var resource = '../data/' + name + '.json';

        storage.add({
            id: name,
            visible: visible,
            on: visible
        }).then(function () {
            $.get(resource).success(function (response) {
                response.forEach(function (item) {
                    var container = storage.get([name, item.tag]);
                    var promise;
                    if (container) {
                        promise = new Promise(function (resolve) {
                            resolve();
                        })
                    } else {
                        promise = storage.add({
                            id: item.tag,
                            visible: visible,
                            on: visible,
                            type: type
                        }, name)
                    }
                    promise.then(function () {
                        storage.add(item, [name, item.tag], type, visible);
                    });
                })
            })
        });
    }

    return Loader;

})();