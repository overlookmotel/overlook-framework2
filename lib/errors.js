// --------------------
// Overlook
// Errors
// --------------------

// modules
var util = require('util');

// exports
var Errors = module.exports = {};

// base error - all other errors subclassed from this
var BaseError = Errors.Base = function(message) {
	var tmp = Error.call(this, message);
	tmp.name = this.name = 'OverlookError';
    this.message = tmp.message;
    Error.captureStackTrace(this, this.constructor);
};
util.inherits(BaseError, Error);

// plugin error
Errors.Plugin = function(message) {
	BaseError.call(this, message);
	this.name = 'OverlookPluginError';
};
util.inherits(Errors.Plugin, BaseError);

// view error
Errors.View = function(message) {
	BaseError.call(this, message);
	this.name = 'OverlookViewError';
};
util.inherits(Errors.View, BaseError);
