'use strict';

fruskac.Request = (function () {

    /**
     * Request
     * @global
     * @constructor
     */
    function Request() {
    }

    /**
     * @global
     */
    Request.prototype = {

        /**
         * Get value of a parameter from URL by name
         * @param {string} name
         * @param {undefined|string} url
         * @returns {string}
         */
        get: function (name, url) {
            if (!url) {
                url = window.location.href;
            }
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        },

        /**
         * Get value of a parameter as an array, using 'comma' as splitting character
         * @param {string} name
         * @returns {Array}
         */
        getParts: function (name) {
            var value = this.get(name);
            if (!value) {
                return;
            }
            return value.split(',');
        }

    };

    return Request;

})();