'use strict';

// expose API
window.fruskac = fruskac.Api;

var util = new fruskac.Util(),
    request = new fruskac.Request(),
    event,
    i18n,
    storage,
    gmap,
    map,
    chart,
    dialog,
    geolocation;

/**
 * Initialize the map
 */
fruskac.init = function () {

    event = new fruskac.Event();

    fruskac.isCrossDomain = window.self !== window.top && document.referrer && !(new RegExp('//' + document.domain)).test(document.referrer);
    fruskac.isMobile = document.getElementById('map_container').getBoundingClientRect().width < 1024;
    fruskac.allowfullscreen = window.frameElement && window.frameElement.hasAttribute('allowFullScreen');
    fruskac.allowBrand = !window.frameElement || !window.frameElement.hasAttribute('allowBrand') || !window.frameElement.getAttribute('allowBrand');

    if (fruskac.isCrossDomain || fruskac.allowBrand) {
        // remove logo "hidden" class
        util.removeClass(document.getElementById('map_logo'), 'hidden');
    }

    i18n = new fruskac.I18n(fruskac.config.lang);

    storage = new fruskac.Storage();

    var mapConfig = {
        center: new google.maps.LatLng(45.167031, 19.69677),
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER
        },
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        gestureHandling: 'greedy',
    };

    var latLngZoom = request.get(PARAMETER_COORDINATES);
    if (latLngZoom) {
        var latLngZoomParts = request.getParts(PARAMETER_COORDINATES);
        if (latLngZoomParts && latLngZoomParts.length) {
            if (latLngZoomParts[0] && latLngZoomParts[1]) {
                mapConfig.center = new google.maps.LatLng(latLngZoomParts[0], latLngZoomParts[1]);
            }
            if (latLngZoomParts[2]) {
                mapConfig.zoom = parseFloat(latLngZoomParts[2]);
            }
        }
    }

    gmap = new google.maps.Map(document.getElementById('map'), mapConfig);

    var overlayImageBounds = {
        north: 45.166508,
        south: 45.136001,
        east: 19.767672,
        west: 19.681498
    };
    var overlayOptions = {
        opacity: 0.8,
        clickable: false
    };
    var groundOverlay = new google.maps.GroundOverlay(
        IMAGE_OVERLAY,
        overlayImageBounds,
        overlayOptions
    );
    groundOverlay.setMap(gmap);

    map = new fruskac.Map();
    dialog = new fruskac.Dialog();
    geolocation = new fruskac.Geolocation();

    /*clusterer = new MarkerClusterer(gmap, [], {
        maxZoom: 12,
        gridSize: 50,
        styles: [
            {
                textColor: 'white',
                height: 24,
                width: 24
            },
            {
                textColor: 'white',
                height: 32,
                width: 32
            },
            {
                textColor: 'white',
                height: 48,
                width: 48
            }
        ]
    });

    clusterer.setEnabled = function (value) {
        clusterer.enabled = value;
        if (value) {
            clusterer.setMaxZoom(12);
            clusterer.setGridSize(50);
        } else {
            clusterer.setMaxZoom(1);
            clusterer.setGridSize(1);
        }
        clusterer.resetViewport();
        clusterer.redraw();
    };

    clusterer.setEnabled(fruskac.config.clustering);*/

    chart = new fruskac.Chart(document.getElementById('chart_container'));

    var loader = new fruskac.Loader();

    var track = request.get(PARAMETER_TRACK);
    var focus = request.get(PARAMETER_FOCUS);

    loader.load(fruskac.config.data).then(function () {

        if (track) {
            // load external track
            loader.append(track, TYPE_TRACK).then(function (object) {
                google.maps.event.addListenerOnce(gmap, 'idle', function () {
                    map.focus(object); // focus on appended object
                });
            })
        }

        if (focus) {
            // focus on selector
            google.maps.event.addListenerOnce(gmap, 'idle', function () {
                storage.focus(focus, true); // focus on selected object
            });
        }

        if (!(track || focus) && latLngZoom && latLngZoomParts && latLngZoomParts.length) {
            // add circle marker if track/location not set
            google.maps.event.addListenerOnce(gmap, 'idle', function () {
                map.placeMarker(new google.maps.LatLng(latLngZoomParts[0], latLngZoomParts[1]), null, true); // create pulsating marker
            });
        }

        event.publish('ready');

    });
};
