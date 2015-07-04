// --------------------
// Overlook
// Logger
// --------------------

// imports
var _ = require('./utils')._;

// exports
var logger = module.exports = function() {
    return logger.info.apply(this, arguments);
};

['fatal', 'error', 'warn', 'info', 'debug', 'trace'].forEach(function(level) {
    logger[level] = function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(level);
        return log.apply(this, args);
    };
});

function log(level, message) {
    if (level != 'info') message = _.capitalize(level) + ': ' + message;
    console.log(message);
}
