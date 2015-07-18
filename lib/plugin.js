// --------------------
// Overlook
// Plugin constructor
// --------------------

// modules
var promisifyAny = require('promisify-any');

// imports
var Utils = require('./utils'),
    _ = Utils._,
    Errors = require('./errors');

// exports
var Plugin = module.exports = function(name, params) {
    // deal with if not called with `new`
    if (!(this instanceof Plugin)) return new Plugin(name, params);

    // validate input
    if (!name || typeof name != 'string') throw new Errors.Plugin('Plugin name must be a string');
    if (!params || typeof params != 'object') throw new Errors.Plugin('Plugin params must be an object');

    // save params and name to plugin
    _.extend(this, params);
    this.name = name;

    // promisify start function and promisify generators
    this.start = promisifyAny(this.start, 1);
    promisifyAny.generators(this);
};
