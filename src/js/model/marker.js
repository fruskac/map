'use strict';

(function (fruskac, google) {

    /**
     *
     * @param {Object|undefined} options
     * @constructor
     */
    var Marker = function (options) {

        options = _.extend({
            map: fruskac.map.getMap()
        }, options);

        var icon;

        switch (options.icon) {
            case 'lakes':
                icon = 'mm_20_purple';
                break;
            case 'monasteries':
                icon = 'mm_20_yellow';
                break;
            case 'misc':
                icon = 'mm_20_blue';
                break;
            case 'springs':
                icon = 'mm_20_white';
                break;
            case 'picnic-areas':
                icon = 'mm_20_green';
                break;
            case 'monuments':
                icon = 'mm_20_red';
                break;
            case 'fishponds':
                icon = 'mm_20_black';
                break;
            case 'waterfalls':
                icon = 'mm_20_orange';
                break;
            case 'lookouts':
                icon = 'mm_20_gray';
                break;
            case 'meadows':
                icon = 'mm_20_brown';
                break;
            default:
                icon = 'mm_20_white';
                break;
        }

        options.icon = 'http://maps.gstatic.com/mapfiles/ridefinder-images/' + icon + '.png'

        return (function () {

            var marker = new google.maps.Marker(options);

            google.maps.event.addListener(marker, 'click', function () {
                Map.showInfoWindow(getInfoWindowContent(options.data), this);
            });

            return marker;

        })();
    };

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

    fruskac.prototype.Marker = Marker;

})(window.fruskac, google);