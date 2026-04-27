const app = require('../Src/app');
// const listEndpoints = require('express-list-endpoints');

try {
    const endpoints = listEndpoints(app);
    console.log(JSON.stringify(endpoints, null, 2));
} catch (err) {
    console.error('Error listing endpoints:', err.message);
    // Fallback if express-list-endpoints is not installed
    app._router.stack.forEach(print.bind(null, []))
}

function print(path, layer) {
  if (layer.route) {
    layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))))
  } else if (layer.name === 'router' && layer.handle.stack) {
    layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp))))
  } else if (layer.method) {
    console.log('%s /%s', layer.method.toUpperCase(), path.concat(split(layer.regexp)).filter(Boolean).join('/'))
  }
}

function split(thing) {
  if (typeof thing === 'string') {
    return thing.split('/')
  } else if (thing.fast_slash) {
    return ''
  } else {
    var match = thing.toString()
      .replace('\\/?', '')
      .replace('(?=\\/|$)', '$')
      .match(/^\/\^\\\/([^\$]*)\\\$/)
    return match
      ? match[1].replace(/\\/g, '').split('/')
      : '<complex:' + thing.toString() + '>'
  }
}
