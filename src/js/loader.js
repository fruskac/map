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
    load(items) {
      const promises = [];

      items.forEach(function (item) {
        if (item.constructor !== Array) {
          item = Object.keys(item).map((key) => item[key]);
        }

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
    append(url, type) {
      return map.add(url, type, true);
    },

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
    options = util.extend({
      visible: false,
      show: [],
      hide: [],
      color: null,
    }, options);

    return storage.add({
      id: name.toLowerCase(),
      visible: options.visible,
      on: options.visible,
    }).then(() => new Promise((resolve) => {
      const request = new XMLHttpRequest();

      request.open('GET', url, true);

      request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
          const promises = [];

          JSON.parse(request.responseText).forEach((item) => {
            let p;
            const
              container = storage.get([name, item.tag]);

            const v = (function () {
              if (options.show.length) { // whitelist
                return options.show.indexOf(item.tag) !== -1;
              }

              if (options.hide.length) { // blacklist
                return options.show.indexOf(item.tag) === -1;
              }

              return options.visible;
            }());

            if (container) {
              // dummy promise to allow promise chain
              p = new Promise((resolve) => {
                resolve();
              });
            } else {
              // create subcategory
              p = storage.add({
                id: item.tag.toLowerCase(),
                visible: v,
                on: v,
                type,
              }, name);
            }

            p.then(() => {
              // when subcategory is created, add map item to storage
              storage.add(item, [name.toLowerCase(), item.tag], type, v, options.color);
            });

            promises.push(p);
          });

          Promise.all(promises).then(() => {
            resolve();
          });
        }
      };

      request.send();
    }));
  }
}());
