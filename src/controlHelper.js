var $control = $('<div id="control"></div>').insertBefore('#map');

setTimeout(function () {
  compile(DataService.root(), $control);
}, 1000)

function compile(items, $element, selector) {
  var $ul = $('<ul>').appendTo($element);
  items.forEach(function (item) {
    if (!_.isObject(item) || !item.id) {
      return;
    }
    var s = (selector ? selector + ':' : '' ) + item.id;
    var $li = $('<li>').appendTo($ul);
    var $label = $('<label>').appendTo($li);
    $label.append('<input type="checkbox" id="' + s+ '" '+ (DataService.getState(s) ? 'checked' : '') + ' onclick="toggle(this, \'' + s + '\')">')
    $label.append(item.id + '['+item.type+'] (' + s + ')');
    if (item.type === 'track') {
      $label.after('<a href="javascript:;" onclick="select(this, \'' + s + '\')">select</a>');
    }
    if (item.children) {
      compile(item.children, $li, s);
    }
  })
}

function toggle(target, selector) {
  DataService.setState(selector, !DataService.getState(selector));
  $(target).closest('li').find('ul input').attr('disabled', !DataService.getState(selector))
}

function select(target, selector) {

  return DataService.select(selector);

  // todo: make select a DataSevice method
  $(target).closest('ul').find('input').each(function (index, input) {
    var s = $(input).attr('id');
    console.log(s);
    var object = DataService.get(s);
    console.log(object)
    DataService.setState(s, s === selector);
  })
}