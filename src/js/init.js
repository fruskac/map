var TYPES = {
  MARKER: 'marker',
  TRACK: 'track',
  KML: 'kml'
};

var DataService = new DataService();

var MapService = new MapService(new google.maps.Map(document.getElementById('map'), {
  center: new google.maps.LatLng(45.167031, 19.69677),
  zoom: 10,
  mapTypeId: google.maps.MapTypeId.TERRAIN,
  mapTypeControl: false,
  zoomControlOptions: {
    position: google.maps.ControlPosition.LEFT_BOTTOM
  },
  streetViewControlOptions: {
    position: google.maps.ControlPosition.LEFT_BOTTOM
  }
}));

var Clusterer = new MarkerClusterer(MapService.getMap(), [], {
  gridSize: 50,
  imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
});

Clusterer.enabled = true;

var ChartService = new ChartService(document.getElementById('chart'));

load('locations', TYPES.MARKER, true);
load('marathon', TYPES.TRACK, true);
load('protection', TYPES.KML, true);
load('time', TYPES.MARKER, true);

window.FruskacMap = {
  ready: function (callback) {
    callback();
  },
  getData: function () {
    return DataService.getSelectors();
  },
  clustering: function (value) {
    if (value === undefined) { // act as getter
      return Clusterer.enabled;
    } else { // act as setter
      Clusterer.enabled = value;
      if (value) {
        Clusterer.setMaxZoom(null);
        Clusterer.setGridSize(50);
      } else {
        Clusterer.setMaxZoom(1);
        Clusterer.setGridSize(1);
      }
      Clusterer.resetViewport();
      Clusterer.redraw();
    }
  },
  type: function (value) {
    if (value === undefined) { // act as getter
      return MapService.getMap().getMapTypeId();
    } else { // act as setter
      return MapService.getMap().setMapTypeId(value);
    }
  }
};

/**
 * Initialize layers
 *
 * @param {String} name
 * @param {String} type
 * @param {Boolean} visible
 */
function load(name, type, visible) {

  var resource = '../data/' + name + '.json';

  DataService.add({
    id: name,
    visible: visible,
    on: visible
  }).then(function () {
    $.get(resource).success(function (response) {
      response.forEach(function (item) {
        var container = DataService.get([name, item.tag]);
        var promise;
        if (container) {
          promise = new Promise(function (resolve) {
            resolve();
          })
        } else {
          promise = DataService.add({
            id: item.tag,
            visible: visible,
            on: visible,
            type: type
          }, name)
        }
        promise.then(function () {
          DataService.add(item, [name, item.tag], type, visible);
        });
      })
    })
  });

}
