'use strict';

fruskac.Request = (function () {

    function Request() {
    }

    Request.prototype = {

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