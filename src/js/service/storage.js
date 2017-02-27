'use strict';

(function (window, fruskac) {
    /**
     * @param {Array} Initial data array
     * @constructor
     */
    function Storage(data) {
        if (!data) {
            data = [];
        }
        this.data = data;
    }

    Storage.prototype = {

        /**
         * Add object to storage
         * @param {Object} value
         * @param {Array|string} selector
         * @param {string} type
         * @param {boolean} visible
         * @returns {*}
         */
        add: function (value, selector, type, visible) {

            var self = this;

            selector = parseSelector(selector);

            var container;

            if (selector) {
                var object = self.get(selector);
                if (object) {
                    if (!object.children) {
                        object.children = [];
                    }
                    container = object.children;
                }
            } else {
                container = self.data;
            }

            if (type) {
                object.type = type;
                return fruskac.map.add(value, type, visible).then(function (object) {
                    container.push(object);
                });
            } else {
                return new Promise(function (resolve) {
                    container.push(value);
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
                var container = _.find(container, {id: selectorParts[0]}).children;
                selectorParts = selectorParts.splice(1);
                return this.get(selectorParts.join(':'), container);
            }

            return _.find(container, {id: selector});

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

            selector = parseSelector(selector);

            var self = this;

            var object = this.get(selector);

            if (object) {
                object.visible = value;

                if (object.children) {
                    object.children.forEach(function (child) {
                        if (child.id) {
                            self.setVisible([selector, child.id], value)
                        } else {
                            var v = value ? object.on : false;
                            fruskac.map.setVisible(child, v);
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
         * Select object based on selector
         * @param {Array|string} selector
         */
        select: function (selector) {

            var self = this;

            selector = parseSelector(selector);

            var object = self.get(selector);

            if (hasParentSelector(selector)) {

                var parent = self.get(getParentSelector(selector));

                self.setState(parent.id, true);

                parent.children.forEach(function (child) {
                    self.setState([parent.id, child.id], child.id === object.id);
                });

            }

            fruskac.map.focus(object.children[0])

        },

        getSelectors: function () {
            return getSelectorsForContainer(fruskac.storage.root());
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
        if (_.isArray(selector)) {
            selector = selector.join(':');
        }

        return selector;

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

            if (!item.id) {
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
                    return fruskac.storage.getState(itemSelector);
                },
                setVisible: function (value) {
                    return fruskac.storage.setState(itemSelector, value);
                },
                select: function () {
                    return fruskac.storage.select(itemSelector);
                }
            };

            if (item.type) {
                object.type = item.type;
            }

            if (item.children && item.children.length) {
                var subChildren = getSelectorsForContainer(item.children, itemSelector);
                if (subChildren && subChildren.length) {
                    object.children = subChildren;
                }
            }

            children.push(object)

        });

        return children;

    }


    fruskac.Storage = Storage;

})(window, window.fruskac);