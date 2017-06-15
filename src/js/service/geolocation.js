'use strict';

fruskac.Geolocation = (function () {

    /**
     * @global
     * @param {Array} Initial data array
     * @constructor
     */
    function Geolocation() {

        var self = this;

        var enabled;

        // Try HTML5 geolocation.
        if (navigator.geolocation) {

            self.marker = new google.maps.Marker({
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: '#d2003b',
                    fillOpacity: 1.0,
                    strokeColor: '#d2003b',
                    strokeOpacity: .5,
                    strokeWeight: 3,
                    scale: 6
                }
            });

            self.marker.setMap(gmap);

            update();

            setInterval(function () {
                update();
            }, 5000);

        } else {
            console.error('Browser doesn\'t support Geolocation');
        }

        /**
         * Get user's location
         */
        function update() {
            navigator.geolocation.getCurrentPosition(function (position) {

                var LatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                self.marker.setPosition(LatLng);

                if (!enabled) {
                    util.show(document.getElementById('map_button_locate'));
                    enabled = true;
                }

            }, function () {
                console.error('HTML5 location error')
            });
        }

    }

    /**
     * @global
     */
    Geolocation.prototype = {

        /**
         * Center map on user's location
         */
        locate: function () {
            gmap.setCenter(this.marker.position);
            gmap.setZoom(16);
        }

    };

    window.locate = function () {
        geolocation.locate()
    };

    return Geolocation;

})();