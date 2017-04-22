'use strict';

fruskac.Util = (function () {

    function Util() {
    }

    Util.prototype = {
        addClass: function (element, className) {
            if (element.classList)
                element.classList.add(className);
            else
                element.className += ' ' + className;
        },

        removeClass: function (element, className) {
            if (element.classList)
                element.classList.remove(className);
            else
                element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        },

        show: function (element) {
            element.style.display = '';
        },

        remove: function (element) {
            element.parentNode.removeChild(element);
        },

        /**
         * Merge defaults with user options
         * @private
         * @param {Object} defaults Default settings
         * @param {Object} options User options
         * @returns {Object} Merged values of defaults and options
         */
        extend: function (defaults, options) {
            var extended = {};
            var prop;
            for (prop in defaults) {
                if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                    extended[prop] = defaults[prop];
                }
            }
            for (prop in options) {
                if (Object.prototype.hasOwnProperty.call(options, prop)) {
                    extended[prop] = options[prop];
                }
            }
            return extended;
        }

    };

    return Util;

})();