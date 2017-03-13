'use strict';

fruskac.i18n = (function () {

    var source = {};

    function i18n(lang) {
        this.lang = lang;
        Object.keys(fruskac.I18N.SOURCE).forEach(function (key) {
            add(key, fruskac.I18N.SOURCE[key])
        })
    }

    i18n.prototype = {
        translate: function (id) {
            return source[this.lang] && source[this.lang][id] || '__TRANSLATION_MISSING__';
        }
    };

    function add(id, values) {
        values.forEach(function (value) {
            fruskac.I18N.LANGUAGES.forEach(function (lang) {
                if (value[lang]) {
                    if (!source[lang]) {
                        source[lang] = {};
                    }
                    source[lang][id] = value[lang];
                }
            })
        });
    }

    return i18n;

})();