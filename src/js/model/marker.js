'use strict';

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
        this.data = options.data;
        this.setValues({
            position: new google.maps.LatLng(parseFloat(options.position.lat()), parseFloat(options.position.lng())),
            map: gmap
        });
    }

    /**
     * Draw Overlay
     */
    Marker.prototype.draw = function () {
        var self = this;
        var div = this.div;
        if (!div) {
            div = this.div = $('' +
                '<div' + (this.options.visible ? '' : ' class="hidden"') + '>' +
                '<div class="marker-shadow"></div>' +
                '<div class="marker-wrap" title="' + this.options.title + '">' +
                '<div class="marker marker-' + this.options.icon + '"></div>' +
                '</div>' +
                '</div>' +
                '')[0];
            this.markerWrap = this.div.getElementsByClassName('marker-wrap');
            this.marker = this.div.getElementsByClassName('marker');
            this.markerShadow = this.div.getElementsByClassName('marker-shadow');
            div.style.position = 'absolute';
            div.style.cursor = 'pointer';
            var panes = this.getPanes();
            panes.overlayImage.appendChild(div);

            // add wobble animation on enter
            setTimeout(function () {
                self.animateWobble();
            }, Math.random() * 800 + 200);

            google.maps.event.addDomListener(div, "click", function () {
                self.animateWobble();
                self.showInfoWindow();
            });
        }

        self.setPoint(self.position);

    };

    /**
     * Set position of Marker
     *
     * @param {LatLng|LatLngLiteral} position
     */
    Marker.prototype.setPoint = function (position) {
        var point = this.getProjection().fromLatLngToDivPixel(position);
        this.div.style.left = point.x + 'px';
        this.div.style.top = point.y + 'px';
        this.div.style.zIndex = Math.round(point.y * 100);
    };

    /**
     * Set visibility
     *
     * @param {boolean} value
     */
    Marker.prototype.setVisible = function (value) {

        var self = this;

        if (self.div) {
            if (value) {
                setTimeout(function () {
                    util.removeClass(self.div, 'hidden');

                    // add wobble animation on enter
                    self.animateWobble();

                    //clusterer.addMarker(object);
                }, Math.random() * 400);
            } else {
                setTimeout(function () {
                    util.addClass(self.div, 'hidden');
                    //clusterer.removeMarker(object);
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
        if (this.div) {
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
     * onRemove handler
     */
    Marker.prototype.onRemove = function () {
        this.remove();
    };

    Marker.prototype.showInfoWindow = function () {
        map.showInfoWindow(getInfoWindowContent(this.options.data), this.getPosition());
    };

    /**
     * Animate Marker with "Drop" animation
     */
    Marker.prototype.animateDrop = function () {
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
    };

    /**
     * Animate Marker with Bounce animation
     */
    Marker.prototype.animateBounce = function () {
        dynamics.stop(this.markerWrap);
        dynamics.css(this.markerWrap, {
            'transform': 'none'
        });
        dynamics.animate(this.markerWrap, {
            translateY: -30
        }, {
            type: dynamics.forceWithGravity,
            bounciness: 0,
            duration: 500,
            delay: 150
        });

        dynamics.stop(this.marker);
        dynamics.css(this.marker, {
            'transform': 'none'
        });
        dynamics.animate(this.marker, {
            scaleY: 0.8
        }, {
            type: dynamics.bounce,
            duration: 800,
            bounciness: 0
        });
        dynamics.animate(this.marker, {
            scaleY: 0.8
        }, {
            type: dynamics.bounce,
            duration: 800,
            bounciness: 600,
            delay: 650
        });

        dynamics.stop(this.markerShadow);
        dynamics.css(this.markerShadow, {
            'transform': 'none',
        });
        dynamics.animate(this.markerShadow, {
            scale: 0.6
        }, {
            type: dynamics.forceWithGravity,
            bounciness: 0,
            duration: 500,
            delay: 150
        });
    };

    /**
     * Animate Marker with Wobble animation
     */
    Marker.prototype.animateWobble = function () {
        dynamics.stop(this.markerWrap);
        dynamics.css(this.markerWrap, {
            'transform': 'none'
        });
        dynamics.animate(this.markerWrap, {
            rotateZ: Math.random() * 90 - 45
        }, {
            type: dynamics.bounce,
            duration: 1800
        });

        dynamics.stop(this.marker);
        dynamics.css(this.marker, {
            'transform': 'none'
        });
        dynamics.animate(this.marker, {
            scaleX: 0.8
        }, {
            type: dynamics.bounce,
            duration: 800,
            bounciness: 1800
        });
    };

    return Marker;

    /**
     * Creates HTML that will be presented on InfoWindow
     *
     * @param {Object} data
     * @returns {string}
     */
    function getInfoWindowContent(data) {
        var html = '';

        if (data.image) {
            html += '<img src="' + data.image + '">';
        }

        html += '<h2>' + data.title + '</h2>';

        if (data.description) {
            html += '<p>' + data.description + '</p>';
        }

        html = '<a' + (data.link && ' href="' + data.link + '" target="_blank"') + '>' + html + '</a>';

        return html;
    }

})();
