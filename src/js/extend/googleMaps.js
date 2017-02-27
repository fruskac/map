'use strict';

(function (google) {

    /**
     * Extend google.maps.Polyline to get bounds based on path
     *
     * @returns {google.maps.LatLngBounds}
     */
    google.maps.Polyline.prototype.getBounds = function () {
        var bounds = new google.maps.LatLngBounds();
        this.getPath().forEach(function (item) {
            bounds.extend(new google.maps.LatLng(item.lat(), item.lng()));
        });
        return bounds;
    };


})(google);