// --------------------
// Overlook
// Routes constructors
// --------------------

// modules
var util = require('util');

// imports
var Errors = require('./errors'),
    Utils = require('./utils'),
    Promise = Utils.Promise,
    _ = Utils._;

// exports
var Routes = module.exports = {};

// Base route constructor
var BaseRoute = Routes.Base = function(params) {
    _.extend(this, params);
};

BaseRoute.prototype.initPre = function() {};
BaseRoute.prototype.init = function() {
    return Promise.resolve();
};

BaseRoute.Actions = {};

// Base action constructor
var BaseAction = BaseRoute.Actions.Base = function(params) {
    if (params) _.extend(this, params);
};

BaseAction.prototype.initPre = function() {};
BaseAction.prototype.init = function() {
    // set default view if not defined
    if (!this.view) {
        var treePath = this.treePath.slice(1);
        if (this.overlook.views.indexOf(treePath) != -1) {
            this.view = treePath;
        } else {
            this.view = '_default/all';
        }
    }

    // check view exists
    if (this.overlook.views.indexOf(this.view) == -1) throw new Errors.Base("View '" + this.view + "' specified for " + this.treePath + ' does not exist');

    return Promise.resolve();
};
BaseAction.prototype.all = function() {
    return Promise.resolve();
};
BaseAction.prototype.render = function(locals) {
    var res = this.res;
    return Promise.promisify(res.render, res)(this.view, locals || {})
    .then(function(html) {
        res.send(html);
    });
};

BaseAction.prototype.get = function() {
    return this.render({title: this.treePath}); // xxx replace this
};

// Namespace constructor
Routes.Namespace = function(params) {
    BaseRoute.call(this, params);
};
util.inherits(Routes.Namespace, BaseRoute);

Routes.Namespace.Actions = {};

Routes.Namespace.Actions.Index = function(params) {
    BaseAction.call(this, params);
};
util.inherits(Routes.Namespace.Actions.Index, BaseAction);

Routes.Namespace.prototype.actions = {
    index: new Routes.Namespace.Actions.Index()
};
