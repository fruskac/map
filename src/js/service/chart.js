'use strict';

fruskac.Chart = (function () {

    var chartResolution = 256;

    /**
     * @global
     * @param {HTMLDomElement} container
     * @constructor
     */
    function Chart(container) {
        var self = this;
        self.visible = false;
        self.container = container;
    }

    /**
     * @global
     */
    Chart.prototype = {

        /**
         * Set chart container visibility
         *
         * @param {boolean} value
         */
        setVisible: function (value) {

            var self = this;

            self.visible = value;

            var className = 'on';

            if (self.visible) {
                util.addClass(self.container, className);
            } else {
                util.removeClass(self.container, className);
                map.placeMarker();
            }

            var center = gmap.getCenter();
            google.maps.event.trigger(gmap, "resize");
            gmap.setCenter(center);

        },

        /**
         * Show chart
         *
         * @param {Array} points
         */
        show: function (points, isFixedLayout) {

            var self = this;

            self.setVisible(true);

            if (isFixedLayout) {
                util.remove(document.getElementById('chart_button_close'));
            }

            var elevator = new google.maps.ElevationService;

            // Load the Visualization API and the corechart package.
            google.charts.load('current', {
                packages: ['corechart'],
                language: fruskac.config.lang
            });

            // Set a callback to run when the Google Visualization API is loaded.
            google.charts.setOnLoadCallback(function () {
                getPathElevation(points, elevator, function (rows) {

                    // Create the data table.
                    var data = new google.visualization.DataTable();
                    data.addColumn('number', i18n.translate(I18N_DISTANCE));
                    data.addColumn({type: 'string', role: 'tooltip', 'p': {'html': true}});
                    data.addColumn('number', i18n.translate(I18N_ELEVATION));
                    data.addRows(rows);

                    // Set chart options
                    var options = {
                        lineWidth: 2,
                        areaOpacity: 0.4,
                        series: {
                            0: {
                                color: '#d2003b',
                                visibleInLegend: false
                            }
                        },
                        focusTarget: 'category',
                        axisTitlesPosition: 'none',
                        hAxis: {
                            baselineColor: 'transparent',
                            gridlines: {
                                color: 'transparent'
                            },
                            ticks: [0, Math.round(rows[rows.length - 1][0] * 10) / 10]
                        },
                        vAxis: {
                            baselineColor: 'transparent',
                            minValue: 0,
                            gridlines: {
                                color: 'transparent'
                            }
                        },
                        legend: {
                            position: 'none'
                        },
                        tooltip: {
                            isHtml: true
                        }
                    };

                    // Instantiate and draw our chart, passing in some options.
                    var chart = new google.visualization.AreaChart(document.getElementById('chart'));
                    chart.draw(data, options);

                    var timeout;

                    google.visualization.events.addListener(chart, 'onmouseover', function (coords) {

                        if (timeout) {
                            clearTimeout(timeout);
                        }

                        map.placeMarker(points.getAt(Math.round(coords.row * points.length / chartResolution)), 'tracker');
                    });

                    google.visualization.events.addListener(chart, 'onmouseout', function () {
                        timeout = setTimeout(function () {
                            map.placeMarker(null);
                        }, 300);
                    });

                    window.addEventListener('resize', function () {
                        chart.draw(data, options);
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

        var ratio = Math.round(points.length / chartResolution),
            gpath = [],
            distance = 0;

        points.forEach(function (point, index) {

            if (index % ratio === 0) {
                gpath.push(point);
            }

            distance += parseFloat(index ? getDistance(points.getAt(index), points.getAt(index - 1)) : 0);

        });


        // Create a PathElevationRequest object using this array.
        elevator.getElevationAlongPath({
            'path': gpath,
            'samples': chartResolution
        }, function (elevations) {
            var rows = [],
                r = distance / (elevations.length - 1);

            elevations.forEach(function (e, index) {
                var d = r * index;
                rows.push([d, getTooltipContent(d, e.elevation), e.elevation]);
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
        //return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
        var R = 6378137; // Earth’s mean radius in meter
        var dLat = rad(p2.lat() - p1.lat());
        var dLong = rad(p2.lng() - p1.lng());
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d / 1000; // "d" returns the distance in meter
    }

    /**
     *
     * @param {number} x
     * @returns {number}
     */
    function rad(x) {
        return x * Math.PI / 180;
    }

    /**
     * Get HTML content for tooltip
     * @param distance
     * @param {number} elevation
     * @returns {string}
     */
    function getTooltipContent(distance, elevation) {
        return i18n.translate(I18N_ELEVATION) + ': ' + '<strong>' + Math.round(elevation) + ' m' + '</strong>' +
            '<br>'
            + i18n.translate(I18N_DISTANCE) + ': ' + '<strong>' + Math.round(distance * 10) / 10 + ' km' + '</strong>';
    }

    window.closeChart = function () {
        chart.setVisible(false);
    };

    return Chart;

})();