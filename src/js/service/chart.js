'use strict';

(function (window, $, google, fruskac) {

    /**
     *
     * @param {HTMLDomElement} container
     * @constructor
     */
    var Chart = function (container) {
        this.visible = false;
        this.container = container;
        this.map = fruskac.map.getMap();

        $(this.container)
            .append('<button onclick="fruskac.chart.setVisible(false)">X</button>')
            .append('<div id="chart_content"></div>');

    };

    Chart.prototype = {

        /**
         * Set chart container visibility
         *
         * @param {boolean} value
         */
        setVisible: function (value) {

            this.visible = value;

            var className = 'on';

            if (this.visible) {
                $(this.container).addClass(className);
            } else {
                $(this.container).removeClass(className);
            }

            var center = this.map.getCenter();
            google.maps.event.trigger(this.map, "resize");
            this.map.setCenter(center);

        },

        /**
         * Show chart
         *
         * @param {array} points
         */
        show: function (points) {

            this.setVisible(true);

            var elevator = new google.maps.ElevationService;

            // Load the Visualization API and the corechart package.
            google.charts.load('current', {'packages': ['corechart']});

            // Set a callback to run when the Google Visualization API is loaded.
            google.charts.setOnLoadCallback(function () {
                getPathElevation(points, elevator, function (rows) {

                    // Create the data table.
                    var data = new google.visualization.DataTable();
                    data.addColumn('number', 'Distance');
                    data.addColumn('number', 'Elevation');
                    data.addRows(rows);

                    // Set chart options
                    var options = {
                        lineWidth: 5,
                        focusTarget: 'category',
                        hAxis: {
                            title: 'Distance (km)'
                        },
                        vAxis: {
                            title: 'Elevation (m)',
                            minValue: 0
                        },
                        legend: {
                            position: "none"
                        }
                    };

                    // Instantiate and draw our chart, passing in some options.
                    var chart = new google.visualization.AreaChart(document.getElementById('chart_content'));
                    chart.draw(data, options);

                    google.visualization.events.addListener(chart, 'onmouseover', function (coords) {
                        fruskac.map.placeMarker(points.getAt(coords.row))
                    });

                });
            });


        }
    };


    /**
     *
     * @param {Object[]} points
     * @param {google.maps.ElevationService} elevator
     * @param {Function} callback
     */
    function getPathElevation(points, elevator, callback) {

        var gpath = [];
        points.forEach(function (point) {
            gpath.push(point)
        });

        // Create a PathElevationRequest object using this array.
        elevator.getElevationAlongPath({
            'path': gpath,
            'samples': gpath.length
        }, function (elevations) {
            var distance = 0;
            var rows = [];
            elevations.forEach(function (e, index) {
                var distanceFromPrevious;
                if (index) {
                    distanceFromPrevious = getDistance(elevations[index].location, elevations[index - 1].location)
                } else {
                    distanceFromPrevious = 0;
                }
                distance += parseFloat(distanceFromPrevious);
                rows.push([distance, e.elevation]);
            });
            callback(rows);
        });
    }

    /**
     * calculates distance between two points in km's
     *
     * @param {google.maps.LatLng} p1
     * @param {google.maps.LatLng} p2
     * @returns {string}
     */
    function getDistance(p1, p2) {
        var R = 6378137; // Earth’s mean radius in meter
        var dLat = rad(p2.lat() - p1.lat());
        var dLong = rad(p2.lng() - p1.lng());
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return (d / 1000).toFixed(2); // "d" returns the distance in meter
        //return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
    }

    /**
     *
     * @param {number} x
     * @returns {number}
     */
    function rad(x) {
        return x * Math.PI / 180;
    }

    fruskac.prototype.Chart = Chart;

})(window, jQuery, google, window.fruskac);