/**
 *
 * @param {Object|undefined} options
 * @constructor
 */
function Marker(options) {

  options = _.extend({
    map: MapService.getMap()
  }, options);

  switch (options.icon) {
    case 'lakes':
      options.icon = 'http://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_purple.png';
      break;
    case 'monasteries':
      options.icon = 'http://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_yellow.png';
      break;
    case 'misc':
      options.icon = 'http://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_blue.png';
      break;
    case 'springs':
      options.icon = 'http://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_white.png';
      break;
    case 'picnic-areas':
      options.icon = 'http://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_green.png';
      break;
    case 'monuments':
      options.icon = 'http://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_red.png';
      break;
    case 'fishponds':
      options.icon = 'http://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_black.png';
      break;
    case 'waterfalls':
      options.icon = 'http://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_orange.png';
      break;
    case 'lookouts':
      options.icon = 'http://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_gray.png';
      break;
    case 'meadows':
      options.icon = 'http://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_brown.png';
      break;
    default:
      options.icon = 'http://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_white.png';
      break;
  }

  return (function () {

    var marker = new google.maps.Marker(options);

    google.maps.event.addListener(marker, 'click', function () {
      MapService.showInfoWindow(getInfoWindowContent(options.data), this);
    });

    return marker;

  })();
}

/**
 * Creates HTML that will be presented on InfoWindow
 *
 * @param {Object} data - content data
 * @return {String}
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

