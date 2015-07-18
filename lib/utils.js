// --------------------
// Overlook
// Utils
// --------------------

// modules
var Promise = require('bluebird'),
    co = require('co-bluebird'),
    coSeries = require('co-series'),
    _ = require('lodash');

// exports
var Utils = module.exports = {
    _: _,
    Promise: Promise,
    co: co,
    coSeries: coSeries
};
