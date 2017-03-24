'use strict';

fruskac.Marker = (function () {

    Marker.prototype = new google.maps.OverlayView();

    /**
     * @global
     * @param {Object|undefined} options
     * @constructor
     */
    function Marker(options) {
        this.options = options;
        this.setValues({
            position: new google.maps.LatLng(parseFloat(options.position.lat()), parseFloat(options.position.lng())),
            map: gmap
        });
    }

    Marker.prototype.draw = function () {
        var self = this;
        var div = this.div;
        if (!div) {
            div = this.div = $('' +
                '<div>' +
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
                self.animateBounce();
                console.log('TODO: show dialog')
            });
        }

        self.setPoint(self.position);

    };

    Marker.prototype.setPoint = function (position) {
        var point = this.getProjection().fromLatLngToDivPixel(position);
        this.div.style.left = point.x + 'px';
        this.div.style.top = point.y + 'px';
        this.div.style.zIndex = Math.round(point.y * 100);
    };

    Marker.prototype.setVisible = function (value) {

        var self = this;

        if (self.div) {
            if (value) {
                util.removeClass(self.div, 'hidden');

                // add wobble animation on enter
                setTimeout(function () {
                    self.animateWobble();
                }, Math.random() * 400);

                //clusterer.addMarker(object);
            } else {
                util.addClass(self.div, 'hidden');
                //clusterer.removeMarker(object);
            }
        }
    };

    Marker.prototype.setOpaque = function (value) {
        if (this.div) {
            if (value) {
                util.removeClass(this.div, 'opaque');
            } else {
                util.addClass(this.div, 'opaque');
            }
        }
    };

    Marker.prototype.getPosition = function () {
        console.log('getPosition')
    };

    Marker.prototype.remove = function () {
        this.div.remove();
    };

    Marker.prototype.onRemove = function () {
        this.remove();
    };

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
            'transform': 'none',
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

    Marker.prototype.animateWobble = function () {
        dynamics.stop(this.markerWrap);
        dynamics.css(this.markerWrap, {
            'transform': 'none',
        });
        dynamics.animate(this.markerWrap, {
            rotateZ: Math.random() * 90 - 45,
        }, {
            type: dynamics.bounce,
            duration: 1800
        });

        dynamics.stop(this.marker);
        dynamics.css(this.marker, {
            'transform': 'none',
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
        var html = '<h1>' + data.title + '</h1>';
        if (data.description) {
            html += '<p>' + data.description + '</p>';
        }
        if (data.image) {
            html += '<img src="' + data.image + '">';
        }
        if (data.link) {
            html += '<a href="' + data.link + '" target="_blank">' + data.link + '</a>';
        }
        return html;
    }

})();
