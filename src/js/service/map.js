'use strict';

fruskac.Map = (function () {

    /**
     * Map
     * @global
     * @param {google.maps.Map} map
     * @constructor
     */
    function Map(map) {

        this.infoWindow = new google.maps.InfoWindow({
            content: "holding..."
        });

        // show fullscreen button if CrossDomain or if "allowfullscreen" attribute added to iframe
        if (fruskac.isCrossDomain || window.frameElement && window.frameElement.hasAttribute('allowFullScreen')) {
            $('#map_container > button').show();
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
                    case fruskac.TYPE.MARKER:
                        return self.addMarker(data, visible).then(function (marker) {
                            resolve(marker);
                        });
                        break;
                    case fruskac.TYPE.TRACK:
                        return self.addTrack(data, visible).then(function (track) {
                            resolve(track);
                        });
                        break;
                    case fruskac.TYPE.KML:
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
                    icon: data.options.icon_data,
                    data: data.data
                });

                marker.setVisible(visible);

                if (visible) {
                    clusterer.addMarker(marker);
                }

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
                url = '../' + data.url;
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
                case fruskac.TYPE.MARKER:
                    object.setVisible(value);
                    if (value) {
                        clusterer.addMarker(object);
                    } else {
                        clusterer.removeMarker(object);
                    }
                    break;
                case fruskac.TYPE.TRACK:
                    object.setVisible(value);
                    break;
                case fruskac.TYPE.KML:
                    object.setMap(value ? gmap : null);
                    break;
            }
        },

        /**
         * Focus one object on map, fit bounds
         * @param {Object} object
         */
        focus: function (object, isFixedLayout) {
            switch (getType(object)) {
                case fruskac.TYPE.MARKER:
                    gmap.setZoom(14);
                    gmap.panTo(object.position);
                    object.setAnimation(google.maps.Animation.BOUNCE);
                    // TODO: show info window
                    //map.showInfoWindow(getInfoWindowContent(options.data), this);
                    break;
                case fruskac.TYPE.TRACK:
                    gmap.fitBounds(object.getBounds());
                    chart.show(object.getPath(), isFixedLayout);
                    break;
            }
        },

        /**
         * Place marker on map
         * @param {google.maps.LatLng} point
         */
        placeMarker: function (point) {

            var self = this;

            if (!self.marker) {
                self.marker = new fruskac.Marker({
                    position: point
                });
            } else {
                self.marker.animateTo(point, {
                    duration: 50
                });
            }
        },

        /**
         * Show info window for Marker
         * @param {string} html
         * @param {google.maps.Marker} marker
         */
        showInfoWindow: function (html, marker) {

            var self = this;

            self.infoWindow.setContent(html);
            self.infoWindow.open(gmap, marker);

        },

        fullscreen: function () {

            var params = {
                c: gmap.getCenter().lat() + ',' + gmap.getCenter().lng() + ',' + gmap.getZoom(),
                l: util.getParameterByName(fruskac.PARAMETER.LAYERS),
                f: util.getParameterByName(fruskac.PARAMETER.FOCUS),
                lang: fruskac.lang
            };

            var url = '/fruskac/map/examples/angularjs.html#!?' + Object.keys(params).map(function(i) {
                    return params[i] && encodeURIComponent(i) + "=" + encodeURIComponent(params[i]);
                }).join('&');

            // TODO: update location when published
            window.open(url, '_blank');
        }
    };

    function getType(object) {
        if (!object) {
            return;
        }
        if (object.hasOwnProperty('position')) {//marker
            return fruskac.TYPE.MARKER;
        } else if (object.hasOwnProperty('strokeColor')) {
            return fruskac.TYPE.TRACK;
        } else if (object.hasOwnProperty('suppressInfoWindows')) {
            return fruskac.TYPE.KML;
        }
    }

    return Map;

})();