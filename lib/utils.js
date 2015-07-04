// --------------------
// Overlook
// Utils
// --------------------

// modules
var Promise = require('bluebird'),
    co = require('co-bluebird'),
    coSeries = require('co-series'),
    isGeneratorFn = require('is-generator').fn,
    _ = require('lodash');

// exports
var Utils = module.exports = {
    _: _,
    Promise: Promise,
    co: co,
    coSeries: coSeries,
    promisifyGenerators: function(obj) {
        Utils._.forIn(obj, function(fn, fnName) {
            if (isGeneratorFn(fn)) obj[fnName] = Utils.co.wrap(fn);
        });
        return obj;
    }
};
