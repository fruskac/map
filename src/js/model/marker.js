'use strict';

fruskac.Marker = (function () {

    /**
     * @global
     * @param {Object|undefined} options
     * @constructor
     */
    function Marker(options) {

        options = _.extend({
            map: gmap
        }, options);

        if (options.icon && options.icon.hasOwnProperty('url')) {
            options.icon = new google.maps.MarkerImage(
                options.icon.url,
                new google.maps.Size(options.icon.width, options.icon.height),
                new google.maps.Point(options.icon.x, options.icon.y)
            )
        }

        return (function () {

            var marker = new google.maps.Marker(options);

            google.maps.event.addListener(marker, 'click', function () {
                map.showInfoWindow(getInfoWindowContent(options.data), this);
            });

            return marker;

        })();
    }

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

    return Marker;

})();
