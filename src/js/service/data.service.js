/**
 *
 * @param data
 * @constructor
 */
function DataService(data) {
  if (!data) {
    data = [];
  }
  this.data = data;
}

DataService.prototype = {

  /**
   *
   * @param value
   * @param selector
   * @param type
   * @param visible
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
      return MapService.add(value, type, visible).then(function (object) {
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
   *
   * @returns {*}
   */
  root: function () {
    return this.data;
  },

  /**
   * Gets object based on selector and container
   *
   * @param {Array|String} selector
   * @param container
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
   * @param {Array|String} selector
   * @param container
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
   * @param {Array|String} selector
   * @param value
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
   * @param {Array|String} selector
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
   * @param {Array|String} selector
   * @param value
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
            MapService.setVisible(child, v);
          }
        })
      }
    }

  },


  /**
   * Get visibility
   *
   * @param {Array|String} selector
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
   * @param {Array|String} selector
   */
  select: function (selector) {

    selector = parseSelector(selector);

    var object = this.get(selector);

    if (hasParentSelector(selector)) {

      var parent = DataService.get(getParentSelector(selector));

      DataService.setState(parent.id, true);

      parent.children.forEach(function (child) {
        DataService.setState([parent.id, child.id], child.id === object.id);
      });

    }

    MapService.focus(object.children[0])

  },

  getSelectors: function () {
    return getSelectorsForContainer(DataService.root());
  }
};

/**
 * Get parent selector
 *
 * @param {Array|String} selector
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
 *
 * @param {Array|String} selector
 * @returns {boolean}
 */
function hasParentSelector(selector) {

  selector = parseSelector(selector);

  return selector.indexOf(':') !== -1;
}

/**
 * Parse array (if provided) into string
 *
 * @param {Array|String} selector
 * @returns {*}
 */
function parseSelector(selector) {
  if (_.isArray(selector)) {
    selector = selector.join(':');
  }

  return selector;

}

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
        return DataService.getState(itemSelector);
      },
      setVisible: function (value) {
        return DataService.setState(itemSelector, value);
      },
      select: function () {
        return DataService.select(itemSelector);
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