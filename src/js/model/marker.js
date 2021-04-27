fruskac.Marker = (function () {
  /**
   * @global
   *
   * @type {google.maps.OverlayView}
   */
  Marker.prototype = new google.maps.OverlayView();

  /**
   * @global
   * @param {Object|undefined} options
   * @constructor
   */
  function Marker(options) {
    this.options = options;
    this.pulsate = this.options.hasOwnProperty('pulsate') && this.options.pulsate;
    this.data = options.data;
    this.setValues({
      position: new google.maps.LatLng(parseFloat(options.position.lat()), parseFloat(options.position.lng())),
      map: gmap,
    });
  }

  /**
   * Draw Overlay
   */
  Marker.prototype.draw = function () {
    const self = this;
    let { div } = self;
    if (!div) {
      div = self.div = document.createElement('div');
      div.setAttribute('class', 'marker-container');
      if (!self.options.visible) {
        div.setAttribute('class', `${div.getAttribute('class')} hidden`);
      }

      if (!self.pulsate) {
        self.markerShadow = document.createElement('div');
        self.markerShadow.setAttribute('class', 'marker-shadow');
        div.appendChild(self.markerShadow);
      }

      self.markerWrap = document.createElement('div');
      self.markerWrap.setAttribute('class', 'marker-wrap');
      if (self.options.hasOwnProperty('title')) {
        self.markerWrap.setAttribute('title', self.options.title);
      }

      if (self.pulsate) {
        const markerPulse = document.createElement('div');
        markerPulse.setAttribute('class', 'marker-pulse');
        self.markerWrap.appendChild(markerPulse);
      } else {
        self.marker = document.createElement('div');
        self.marker.setAttribute('class', `marker marker-${self.options.icon}`);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#icon-${self.options.icon}`);
        svg.appendChild(use);
        self.marker.appendChild(svg);
        self.markerWrap.appendChild(self.marker);
      }

      div.appendChild(self.markerWrap);

      div.style.position = 'absolute';
      div.style.cursor = 'pointer';
      const panes = self.getPanes();
      panes.overlayImage.appendChild(div);

      // if this is a regular marker
      if (!self.pulsate) {
        // add wobble animation on enter
        setTimeout(() => {
          self.animateWobble();
        }, Math.random() * 800 + 200);

        // Show info Window for desktop
        attachEvents('mousedown', 'mouseup');
        // Show info Window for touch devices
        attachEvents('touchstart', 'touchend');
      }
    }

    self.setPoint(self.position);

    /**
     * Attach events which handle click/touch on marker, and show Info Window
     * @param {string} prepareEvent
     * @param {string} executeEvent
     */
    function attachEvents(prepareEvent, executeEvent) {
      google.maps.event.addDomListener(div, prepareEvent, () => {
        // Listen to gesture stop, if not prevented it will open Info Window
        const handleExecuteEvent = google.maps.event.addDomListener(div, executeEvent, () => {
          self.showInfoWindow();
        });
        // Stop Info Window opening on drag start
        var handlePreventExecute = self.map.addListener('dragstart', () => {
          google.maps.event.removeListener(handleExecuteEvent);
          google.maps.event.removeListener(handlePreventExecute);
        });
      });
    }
  };

  /**
   * Set position of Marker
   *
   * @param {LatLng|LatLngLiteral} position
   */
  Marker.prototype.setPoint = function (position) {
    const self = this;
    const point = self.getProjection().fromLatLngToDivPixel(position);
    self.div.style.left = `${point.x}px`;
    self.div.style.top = `${point.y}px`;
    if (!self.pulsate) {
      self.div.style.zIndex = Math.round(point.y * 100);
    }
  };

  /**
   * Set visibility
   *
   * @param {boolean} value
   */
  Marker.prototype.setVisible = function (value) {
    const self = this;

    if (self.hasOwnProperty('div')) {
      self.visible = value;

      if (value) {
        setTimeout(() => {
          util.removeClass(self.div, 'hidden');
          self.animateWobble();
        }, Math.random() * 400);
      } else {
        setTimeout(() => {
          util.addClass(self.div, 'hidden');
        }, Math.random() * 200);
      }
    }
  };

  /**
   * Make marker semi-transparent
   *
   * @param {boolean} value
   */
  Marker.prototype.setOpaque = function (value) {
    if (this.hasOwnProperty('div')) {
      if (value) {
        util.addClass(this.div, 'opaque');
      } else {
        util.removeClass(this.div, 'opaque');
      }
    }
  };

  /**
   * Get position of Marker
   */
  Marker.prototype.getPosition = function () {
    return this.position;
  };

  /**
   * Remove marker
   */
  Marker.prototype.remove = function () {
    this.div.remove();
  };

  /**
   * Show info window for Marker
   */
  Marker.prototype.showInfoWindow = function () {
    const self = this;

    const position = self.getPosition();

    const content = `<a href="${self.data.link}" target="_blank">`
      + `<img src="${self.data.image}" width="280" height="157">`
      + '</a>'
      + '<h2>'
      + `<a href="${self.data.link}" target="_blank">${self.data.title}</a>`
      + '</h2>'
      + `<p>${self.data.description}</p>`
      + `<p><a href="https://maps.google.com/maps?daddr=${position.lat()},${position.lng()}" target="_blank" >`
      + '<svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-directions"></use></svg></a></p>';

    dialog.open(content, self);
  };

  /**
   * Animate Marker with "Drop" animation
   */
  /* Marker.prototype.animateDrop = function () {
     dynamics.stop(this.markerWrap);
     dynamics.css(this.markerWrap, {
     'transform': 'scaleY(2) translateY(-' + $('#map').outerHeight() + 'px)',
     'opacity': '1'
     });
     dynamics.animate(this.markerWrap, {
     translateY: 0,
     scaleY: 1.0
     }, {
     type: dynamics.gravity,
     duration: 1800
     });

     dynamics.stop(this.marker);
     dynamics.css(this.marker, {
     'transform': 'none'
     });
     dynamics.animate(this.marker, {
     scaleY: 0.8
     }, {
     type: dynamics.bounce,
     duration: 1800,
     bounciness: 600
     });

     dynamics.stop(this.markerShadow);
     dynamics.css(this.markerShadow, {
     'transform': 'scale(0,0)',
     });
     dynamics.animate(this.markerShadow, {
     scale: 1
     }, {
     type: dynamics.gravity,
     duration: 1800
     });
     }; */

  /**
   * Animate Marker with Bounce animation
   */
  Marker.prototype.animateBounce = function () {
    dynamics.stop(this.markerWrap);
    dynamics.css(this.markerWrap, {
      transform: 'none',
    });
    dynamics.animate(this.markerWrap, {
      translateY: -30,
    }, {
      type: dynamics.forceWithGravity,
      bounciness: 0,
      duration: 500,
      delay: 150,
    });

    dynamics.stop(this.marker);
    dynamics.css(this.marker, {
      transform: 'none',
    });
    dynamics.animate(this.marker, {
      scaleY: 0.8,
    }, {
      type: dynamics.bounce,
      duration: 800,
      bounciness: 0,
    });
    dynamics.animate(this.marker, {
      scaleY: 0.8,
    }, {
      type: dynamics.bounce,
      duration: 800,
      bounciness: 600,
      delay: 650,
    });

    dynamics.stop(this.markerShadow);
    dynamics.css(this.markerShadow, {
      transform: 'none',
    });
    dynamics.animate(this.markerShadow, {
      scale: 0.6,
    }, {
      type: dynamics.forceWithGravity,
      bounciness: 0,
      duration: 500,
      delay: 150,
    });
  };

  /**
   * Animate Marker with Wobble animation
   */
  Marker.prototype.animateWobble = function () {
    dynamics.stop(this.markerWrap);
    dynamics.css(this.markerWrap, {
      transform: 'none',
    });
    dynamics.animate(this.markerWrap, {
      rotateZ: Math.random() * 90 - 45,
    }, {
      type: dynamics.bounce,
      duration: 1800,
    });

    dynamics.stop(this.marker);
    dynamics.css(this.marker, {
      transform: 'none',
    });
    dynamics.animate(this.marker, {
      scaleX: 0.8,
    }, {
      type: dynamics.bounce,
      duration: 800,
      bounciness: 1800,
    });
  };

  return Marker;
}());
