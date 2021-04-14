fruskac.Util = (function () {
  function Util() {
  }

  Util.prototype = {

    /**
     * Add a class to a DOM element if class does not exist
     * @param {HTMLDomElement} element
     * @param {string} className
     */
    addClass(element, className) {
      if (this.hasClass(element, className)) return;
      if (element.hasOwnProperty('classList')) element.classList.add(className);
      else element.className += ` ${className}`;
    },

    /**
     * Check if a DOM element has a class
     * @param {HTMLDomElement} element
     * @param {string} className
     */
    hasClass(element, className) {
      return !!(((element.hasOwnProperty('classList') && element.classList.contains(className)) || (` ${element.className} `).indexOf(` ${className} `) > -1));
    },

    /**
     * Remove a class from a DOM element
     * @param {HTMLDomElement} element
     * @param {string} className
     */
    removeClass(element, className) {
      if (element.hasOwnProperty('classList')) element.classList.remove(className);
      else element.className = element.className.replace(new RegExp(`(^|\\b)${className.split(' ').join('|')}(\\b|$)`, 'gi'), ' ');
    },

    /**
     * Show a DOM element
     * @param {HTMLDomElement} element
     */
    show(element) {
      element.style.display = '';
    },

    /**
     * Remove an element from DOM
     * @param {HTMLDomElement} element
     */
    remove(element) {
      element.parentNode.removeChild(element);
    },

    /**
     * Merge defaults with user options
     * @private
     * @param {Object} defaults Default settings
     * @param {Object} options User options
     * @returns {Object} Merged values of defaults and options
     */
    extend(defaults, options) {
      const extended = {};
      let prop;
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
    },

  };

  return Util;
}());
