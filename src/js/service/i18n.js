fruskac.I18n = (function () {
  const source = {};

  /**
   * I18n
   * @global
   * @constructor
   */
  function I18n(lang) {
    this.lang = lang;
    Object.keys(fruskac.I18N.SOURCE).forEach((key) => {
      add(key, fruskac.I18N.SOURCE[key]);
    });
  }

  /**
   * @global
   */
  I18n.prototype = {

    /**
     * Get the translation value from source using 'id' as key
     * @param {string} id
     * @returns {string}
     */
    translate(id) {
      return source[this.lang] && source[this.lang][id] || '__TRANSLATION_MISSING__';
    },
  };

  /**
   * Allow each translation value for current language to be available for getting via 'id'
   * @param id
   * @param values
   */
  function add(id, values) {
    values.forEach((value) => {
      fruskac.I18N.LANGUAGES.forEach((lang) => {
        if (value[lang]) {
          if (!source[lang]) {
            source[lang] = {};
          }
          source[lang][id] = value[lang];
        }
      });
    });
  }

  return I18n;
}());
