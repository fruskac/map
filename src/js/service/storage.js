'use strict';

fruskac.Storage = (function () {

    /**
     * @global
     * @param {Array} Initial data array
     * @constructor
     */
    function Storage(data) {
        if (!data) {
            data = [];
        }
        this.data = data;
    }

    /**
     * @global
     */
    Storage.prototype = {

        /**
         * Add object to storage
         * @param {Object} value
         * @param {Array|string} selector
         * @param {string} type
         * @param {boolean} visible
         * @param {string|object} color
         * @returns {*}
         */
        add: function (value, selector, type, visible, color) {

            var self = this;

            selector = parseSelector(selector);

            var container;

            if (selector) {
                var object = self.get(selector);
                if (object) {
                    if (!object.hasOwnProperty('children')) {
                        object.children = [];
                    }
                    container = object.children;
                }
            } else {
                container = self.data;
            }

            if (type) {
                object.type = type;
                if (value.hasOwnProperty('categories')) {
                    value.categories.forEach(function (category) {
                        var parent = self.get(getParentSelector(selector));
                        if (parent) {
                            if (!parent.hasOwnProperty('categories')) {
                                parent.categories = [];
                            }
                            if (parent.categories.indexOf(category) === -1) {
                                parent.categories.push(category);
                            }
                        }
                    });
                }
                return map.add(value, type, visible, color).then(function (object) {
                    if (value.hasOwnProperty('categories')) {
                        object.categories = value.categories;
                    }
                })
            } else {
                return new Promise(function (resolve) {
                    if (value.visible && value.hasOwnProperty('type')) {
                        container.unshift(value);
                    } else {
                        container.push(value);
                    }
                    resolve(value);
                })
            }

        },

        /**
         * Gets root data array
         * @returns {*}
         */
        root: function () {
            return this.data;
        },

        /**
         * Gets object based on selector and container
         * @param {Array|string} selector
         * @param {Array} container
         * @returns {*}
         */
        get: function (selector, container) {

            selector = parseSelector(selector);

            if (!container) {
                container = this.data;
            }

            if (!selector) {
                return;
            }

            if (selector.indexOf(':') !== -1) {
                var selectorParts = selector.split(':');
                var container = container.find(function (object) {
                    return object.id === selectorParts[0];
                }).children;
                selectorParts = selectorParts.splice(1);
                return this.get(selectorParts.join(':'), container);
            }

            return container.find(function (object) {
                if (object && object.id === selector || (object.hasOwnProperty('data') && object.data.id == selector)) {
                    return object;
                }
            });

        },

        /**
         * Gets children based on selector and container
         * @param {Array|string} selector
         * @param {Array} container
         * @returns {*|Array|HTMLElement[]}
         */
        query: function (selector, container) {

            selector = parseSelector(selector);

            if (!container) {
                container = this.data;
            }

            var object = this.get(selector, container);

            return object.children;

        },

        /**
         * Set state (on/off)
         * @param {Array|string} selector
         * @param {boolean} value
         */
        setState: function (selector, value) {

            event.publish(EVENT_STORAGE_STATE_CHANGE);

            selector = parseSelector(selector);

            var object = this.get(selector);

            if (object) {
                object.on = value;
                this.setVisible(selector, value);
            }

        },

        /**
         * Get state
         * @param {Array|string} selector
         * @returns {*}
         */
        getState: function (selector) {

            selector = parseSelector(selector);

            var object = this.get(selector);

            if (object) {
                return object.on;
            }

        },

        /**
         * Set visibility
         * @param {Array|string} selector
         * @param {boolean} value
         */
        setVisible: function (selector, value) {

            event.publish(EVENT_STORAGE_VISIBILITY_CHANGE);

            selector = parseSelector(selector);

            var self = this;

            var object = this.get(selector);

            if (object) {
                object.visible = value;

                if (object.hasOwnProperty('children')) {
                    object.children.forEach(function (child) {
                        if (child.hasOwnProperty('id')) {
                            self.setVisible([selector, child.id], value)
                        } else {
                            var v = value ? object.on : false;
                            map.setVisible(child, v);
                        }
                    })
                }
            }

        },


        /**
         * Get visibility
         * @param {Array|string} selector
         * @returns {boolean}
         */
        getVisible: function (selector) {

            selector = parseSelector(selector);

            var object = this.get(selector);

            var visible = true;

            if (object) {
                visible = object.visible;

                if (hasParentSelector(selector)) {
                    var parentSelector = getParentSelector(selector);
                    var parentVisible = this.getVisible(parentSelector);
                    if (parentVisible) {
                        if (hasParentSelector(parentSelector)) {
                            return this.getVisible(getParentSelector(parentSelector))
                        }
                    } else {
                        return false;
                    }
                }

            }

            return visible;

        },


        /**
         * Focus object based on selector
         * @param {Array|string} selector
         */
        focus: function (selector, isFixedLayout) {

            event.publish(EVENT_STORAGE_FOCUS);

            var self = this;

            selector = parseSelector(selector);

            var object = self.get(selector);

            focusParents(selector);

            if (object.type === TYPE_TRACK) {

                var parent = self.get(getParentSelector(selector));

                parent.children.forEach(function (child) {
                    if (child.hasOwnProperty('id')) {
                        self.setState([parent.id, child.id], child.id === object.id);
                    }
                });
            }

            map.focus(object && object.hasOwnProperty('children') ? object.children[0] : object, isFixedLayout);

            function focusParents(s) {

                var parentSelector = getParentSelector(s);

                if (parentSelector) {
                    self.setState(parentSelector, true);
                    focusParents(parentSelector);
                }

            }

        },

        /**
         * Highlight certain category of map objects by making all others 'opaque'
         * @param selector
         * @param category
         */
        highlight: function (selector, category) {

            event.publish(EVENT_STORAGE_HIGHLIGHT);

            var self = this;

            selector = parseSelector(selector);

            var object = self.get(selector);

            if (object.hasOwnProperty('children')) {
                object.children.forEach(function (item) {
                    if (item.hasOwnProperty('children')) {
                        item.children.forEach(function (child) {
                            var shoudBeOpaque = category && child.categories.indexOf(category) === -1;
                            child.setOpaque(shoudBeOpaque);
                            if (!shoudBeOpaque) {
                                child.animateWobble();
                            }
                        })
                    }
                })
            }
        },

        /**
         * Get selectors
         * @returns {Array}
         */
        getSelectors: function () {
            return getSelectorsForContainer(storage.root());
        }
    };

    /**
     * Get parent selector
     * @param {Array|string} selector
     * @returns {string}
     */
    function getParentSelector(selector) {

        selector = parseSelector(selector);

        if (!hasParentSelector(selector)) {
            return;
        }

        var selectorParts = selector.split(':');
        selectorParts.splice(-1);

        return selectorParts.join(':');
    }

    /**
     * Test if parent selector is available
     * @param {Array|string} selector
     * @returns {boolean}
     */
    function hasParentSelector(selector) {

        selector = parseSelector(selector);

        return selector.indexOf(':') !== -1;
    }

    /**
     * Parse array (if provided) into string
     * @param {Array|string} selector
     * @returns {*}
     */
    function parseSelector(selector) {

        if (!selector) {
            return;
        }

        if (typeof selector != 'string') {
            selector = selector.join(':');
        }

        return selector.toLowerCase();

    }

    /**
     *
     * @param {Array} items
     * @param {Array|string} selector
     * @returns {Array}
     */
    function getSelectorsForContainer(items, selector) {

        selector = parseSelector(selector);

        var children = [];

        items.forEach(function (item) {

            if (!item.hasOwnProperty('id')) {
                return;
            }

            var itemSelector;
            if (selector) {
                itemSelector = parseSelector([selector, item.id]);
            } else {
                itemSelector = item.id
            }

            var object = {
                id: item.id,
                getVisible: function () {
                    return storage.getState(itemSelector);
                },
                setVisible: function (value) {
                    return storage.setState(itemSelector, value);
                },
                focus: function () {
                    return storage.focus(itemSelector);
                }
            };

            if (item.hasOwnProperty('type')) {
                object.type = item.type;
            }

            if (item.hasOwnProperty('children') && item.children.length) {
                var subChildren = getSelectorsForContainer(item.children, itemSelector);
                if (subChildren && subChildren.length) {
                    object.children = subChildren;
                }
            }

            if (item.hasOwnProperty('categories') && item.categories.length) {
                object.categories = item.categories;
                object.highlight = function (category) {
                    storage.highlight(object.id, category)
                }
            }

            children.push(object)

        });

        return children;

    }

    return Storage;

})();
