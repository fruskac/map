'use strict';

fruskac.Map = (function () {

    /**
     * Map
     * @global
     * @constructor
     */
    function Map() {

        // show fullscreen button if CrossDomain or if "allowfullscreen" attribute added to iframe
        if (fruskac.isCrossDomain || fruskac.allowfullscreen) {
            $('#map_button_fullscreen').show();
        }

    }

    /**
     * @global
     */
    Map.prototype = {

        /**
         * Add object to map
         * @param {Object} data
         * @param {string} type
         * @param {boolean} visible
         * @returns {Promise}
         */
        add: function (data, type, visible) {

            var self = this;

            return new Promise(function (resolve) {
                switch (type) {
                    case TYPE_MARKER:
                        return self.addMarker(data, visible).then(function (marker) {
                            resolve(marker);
                        });
                        break;
                    case TYPE_TRACK:
                        return self.addTrack(data, visible).then(function (track) {
                            resolve(track);
                        });
                        break;
                    case TYPE_KML:
                        return self.addKml(data, visible).then(function (kml) {
                            resolve(kml);
                        });
                        break;
                }
            });

        },

        /**
         * Add marker to map
         * @param {Object} data
         * @param {boolean} visible
         * @returns {Promise}
         */
        addMarker: function (data, visible) {

            return new Promise(function (resolve) {

                var marker = new fruskac.Marker({
                    position: new google.maps.LatLng(data.lat, data.lng),
                    title: data.data.title,
                    icon: data.tag,
                    data: data.data,
                    visible: visible
                });

                if (visible) {
                    //clusterer.addMarker(marker);
                }

                google.maps.event.addListener(marker, 'click', function () {
                    marker.animateWobble();
                });

                resolve(marker);

            })

        },

        /**
         * Add track to map
         * @param {Object} data
         * @param {boolean} visible
         * @returns {Promise}
         */
        addTrack: function (data, visible) {

            var url;

            if (typeof data === 'string') {
                url = data;
            } else {
                url = data.url;
            }

            return new Promise(function (resolve) {

                return $.get(url).then(function (response) {
                    var points = [];
                    $(response).find('trkpt').each(function (i, v) {
                        var lat = Number($(this).attr('lat'));
                        var lon = Number($(this).attr('lon'));
                        var p = new google.maps.LatLng(lat, lon);
                        points.push(p);
                    });

                    var track = new fruskac.Track({
                        path: points
                    });

                    track.setVisible(visible);

                    resolve(track);

                });

            });

        },

        /**
         * Add KML layer to map
         * @param {Object} data
         * @param {boolean} visible
         * @returns {Promise}
         */
        addKml: function (data, visible) {

            return new Promise(function (resolve) {

                var kml = new fruskac.Kml(data.url);

                if (!visible) {
                    kml.setMap(null);
                }

                resolve(kml);

            })

        },

        /**
         * Set visibility on object
         * @param {Object} object
         * @param {boolean} value
         */
        setVisible: function (object, value) {
            switch (getType(object)) {
                case TYPE_MARKER:
                    object.setVisible(value);
                    break;
                case TYPE_TRACK:
                    object.setVisible(value);
                    break;
                case TYPE_KML:
                    object.setMap(value ? gmap : null);
                    break;
            }
        },

        /**
         * Focus one object on map, fit bounds
         * @param {Object} object
         */
        focus: function (object, isFixedLayout) {

            var self = this;

            switch (getType(object)) {
                case TYPE_MARKER:
                    gmap.setZoom(14);
                    gmap.panTo(object.position);
                    var interval = setInterval(function () {
                        object.animateBounce();
                    }, 2000);
                    google.maps.event.addDomListener(object.div, 'click', function () {
                        clearInterval(interval);
                    });
                    break;
                case TYPE_TRACK:
                    self.placeMarker(null);
                    gmap.fitBounds(object.getBounds());
                    chart.show(object.getPath(), isFixedLayout);
                    break;
            }
        },

        /**
         * Place marker on map
         * @param {google.maps.LatLng} point
         * @param {string|undefined} icon
         * @param {boolean|undefined} pulsate
         */
        placeMarker: function (point, icon, pulsate) {

            var self = this;

            if (point) {
                if (self.marker) {
                    self.marker.setPoint(point);
                } else {
                    self.marker = new fruskac.Marker({
                        position: point,
                        visible: true,
                        pulsate: pulsate,
                        icon: icon
                    });
                }

                if (!gmap.getBounds().contains(point)) {
                    gmap.panTo(point);
                }

            } else {
                if (self.marker) {
                    self.marker.remove();
                    self.marker = null;
                }
            }

        },

        fullscreen: function () {

            var params = {
                c: gmap.getCenter().lat() + ',' + gmap.getCenter().lng() + ',' + gmap.getZoom(),
                l: request.get(PARAMETER_LAYERS),
                f: request.get(PARAMETER_FOCUS),
                t: request.get(PARAMETER_TRACK),
                lang: fruskac.config.lang
            };

            var url = fruskac.config.lang + '?' + Object.keys(params).map(function (i) {
                    return params[i] && encodeURIComponent(i) + "=" + encodeURIComponent(params[i]);
                }).join('&');

            window.open(url, '_blank');

        }
    };

    function getType(object) {
        if (!object) {
            return;
        }
        if (object.hasOwnProperty('position')) {//marker
            return TYPE_MARKER;
        } else if (object.hasOwnProperty('strokeColor')) {
            return TYPE_TRACK;
        } else if (object.hasOwnProperty('suppressInfoWindows')) {
            return TYPE_KML;
        }
    }

    window.fullscreen = function () {
        map.fullscreen()
    };

    return Map;

})();