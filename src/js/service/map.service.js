/**
 * MapService
 * @param {google.maps.Map} map
 * @constructor
 */
var MapService = function (map) {
    this.map = map;

    this.infoWindow = new google.maps.InfoWindow({
        content: "holding..."
    });

};

MapService.prototype = {

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
                case TYPES.MARKER:
                    return self.addMarker(data, visible).then(function (marker) {
                        resolve(marker);
                    });
                    break;
                case TYPES.TRACK:
                    return self.addTrack(data, visible).then(function (track) {
                        resolve(track);
                    });
                    break;
                case TYPES.KML:
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
            var marker = new Marker({
                position: new google.maps.LatLng(data.lat, data.lng),
                title: data.data.title,
                icon: data.tag,
                data: data.data
            });

            marker.setVisible(visible);

            Clusterer.addMarker(marker);

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

        return new Promise(function (resolve) {

            return $.get('../' + data.url).then(function (response) {
                var points = [];
                $(response).find('trkpt').each(function (i, v) {
                    var lat = Number($(this).attr('lat'));
                    var lon = Number($(this).attr('lon'));
                    var p = new google.maps.LatLng(lat, lon);
                    points.push(p);
                });

                var track = new Track({
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

            var kml = new Kml(data.url);

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
        if (object.hasOwnProperty('position')) {//marker
            object.setVisible(value);
            if (value) {
                Clusterer.addMarker(object);
            } else {
                Clusterer.removeMarker(object);
            }
        } else if (object.hasOwnProperty('strokeColor')) {
            object.setVisible(value);
        } else if (object.hasOwnProperty('suppressInfoWindows')) {
            object.setMap(value ? this.map : null);
        }
    },

    /**
     * Get map
     * @returns {*}
     */
    getMap: function () {
        return this.map;
    },

    /**
     * Focus one object on map, fit bounds
     * @param {Object} object
     */
    focus: function (object) {
        this.map.fitBounds(object.getBounds());
        ChartService.show(object.getPath())
    },

    /**
     * Place marker on map
     * @param {google.maps.LatLng} point
     */
    placeMarker: function (point) {
        if (!this.marker) {
            this.marker = new Marker({
                position: point
            });
        } else {
            this.marker.animateTo(point, {
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
        this.infoWindow.setContent(html);
        this.infoWindow.open(this.map, marker)
    }
};
