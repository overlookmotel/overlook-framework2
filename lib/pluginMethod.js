// --------------------
// Overlook
// plugin function
// --------------------

// imports
var Plugin = require('./plugin'),
    Errors = require('./errors');

// exports
module.exports = function(plugin, options) {
    // check is a Plugin
    if (!(plugin instanceof Plugin)) throw new Errors.Plugin('Plugin is not an instance of Overlook.Plugin');

    this.log('Attaching plugin ' + plugin.name);

    // save options to plugin
    plugin.options = options || {};

    // save to Overlook.plugins
    this.plugins[plugin.name] = plugin;

    // run init action
    if (plugin.init) plugin.init(this);

    // done
    return this;
};
