// --------------------
// Overlook
// Main module file
// --------------------

// modules
var pathModule = require('path'),
    ejs = require('ejs');

// imports
var Errors = require('./errors'),
    Utils = require('./utils'),
    Plugin = require('./plugin'),
    Routes = require('./routes'),
    log = require('./log'),
    overlook = require('./overlook'),
    pluginMethod = require('./pluginMethod'),
    _ = Utils._;

// exports
var Overlook = module.exports = function(options) {
    if (!(this instanceof Overlook)) return new Overlook(options);

    if (options && !options.noInit) this.init(options);
};

// add Utils, Errors, Plugin, Routes, log to Overlook and Overlook.prototype
Overlook.Utils = Overlook.prototype.Utils = Utils;
Overlook.Errors = Overlook.prototype.Errors = Errors;
Overlook.Plugin = Overlook.prototype.Plugin = Plugin;
Overlook.Routes = Overlook.prototype.Routes = Routes;
Overlook.log = Overlook.prototype.log = log;
Overlook.viewEngines = Overlook.prototype.viewEngines = {ejs: ejs};

// add Overlook to Overlook.prototype
Overlook.prototype.Overlook = Overlook;

// view paths
Overlook.viewsPaths = [pathModule.join(__dirname, '../views')];

// plugins
Overlook.plugins = Overlook.prototype.plugins = {};
Overlook.plugin = pluginMethod;

// prototype methods
Utils.promisifyGenerators(overlook);
_.extend(Overlook.prototype, overlook);
