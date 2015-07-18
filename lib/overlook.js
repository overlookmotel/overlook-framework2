// --------------------
// Overlook
// Overlook prototype
// --------------------

// modules
var pathModule = require('path'),
    http = require('http'),
    express = require('express'),
    expressor = require('expressor'),
    fs = require('fs-extra-promise'),
    promisifyAny = require('promisify-any'),
    requireFolderTree = require('require-folder-tree'),
    walkFolderTree = require('walk-folder-tree');

// imports
var Utils = require('./utils'),
    Promise = Utils.Promise,
    co = Utils.co,
    coSeries = Utils.coSeries,
    _ = Utils._;

// exports
module.exports = promisifyAny.generators({
    init: function(options) {
        // conform options
        if (!options) {
            options = {};
        } else if (typeof options == 'string') {
            options = {paths: {root: options}};
        }

        options = _.extend({
            paths: {},
            port: 3000
        }, options);

        options.paths = _.extend({root: process.cwd()}, options.paths);

        // save options to overlook object
        this.options = options;
        this.name = options.name;

        // save env to overlook object
        this.env = process.env.NODE_ENV || 'development';

        this.log('Initializing Overlook app' + (this.name ? ' ' + this.name : '') + ' (' + this.env + ')');

        // load config
        this.initConfig();

        // conform paths options
        this.getPaths().forEach(function(pathType) {
            if (!options.paths[pathType]) options.paths[pathType] = pathModule.join(options.paths.root, pathType);
        });

        // init viewsPaths
        this.viewsPaths = _.clone(this.Overlook.viewsPaths);
        if (options.paths.views) this.viewsPaths.unshift(options.paths.views);

        // return overlook object
        return this;
    },

    initConfig: function() {
        var options = this.options,
            configPath = options.paths.config || pathModule.join(options.paths.root, 'config');

        this.log('Loading config from ' + configPath);

        if (configPath && fs.existsSync(configPath)) {
            var config = requireFolderTree(configPath);

            if (config.env && config.env[this.env]) {
                _.merge(config, config.env[this.env]);
                config = _.clone(config);
                delete config.env;
            }

            _.merge(options, config);
        }

        options.paths.config = configPath;

        this.log('Loaded config');
    },

    getPaths: function() {
        return ['controllers', 'views', 'public'];
    },

    start: function*() {
        this.log('Starting Overlook app' + (this.name ? ' ' + this.name : ''));

        // init express
    	this.log('Initializing express app');
        this.app = this.expressInit();
        this.log('Initialized express app');

        // init plugins
        this.log('Initializing plugins');
        yield _.mapValues(this.plugins, coSeries(function*(plugin, pluginName) {
            this.log('Initializing plugin ' + pluginName);
            if (plugin.start) yield plugin.start(this);
        }).bind(this));
        this.log('Initialized plugins');

        // init views
        this.log('Loading views from ' + this.options.paths.views);
        yield this.viewsInit();
        this.log('Loaded views');

        // init controllers
        this.log('Loading controllers from ' + this.options.paths.controllers);
        yield this.controllersInit();

        this.routes = this.app.expressor.routes;
        this.log('Loaded controllers');

        // start express app
        this.log('Server starting on port ' + this.options.port);
        this.server = yield this.expressStart(this.options.port);
        this.log('Server listening on port ' + this.options.port);

        // done
        this.log('Server ready');
        return this;
    },

    viewsInit: function*() {
        var views = this.views = {},
            viewEngines = this.viewEngines;

        yield this.viewsPaths.map(coSeries(function*(path) {
            if (!(yield fs.existsAsync(path))) return;

            yield walkFolderTree(path, function*(params) {
                if (params.directory) return;
                var ext = pathModule.extname(params.name).slice(1);
                if (ext && viewEngines[ext]) {
                    var pathWithoutExt = params.path.slice(0, -ext.length - 1);
                    if (!views[pathWithoutExt]) views[pathWithoutExt] = ext;
                }
            });
        }));
    },

    controllersInit: function*() {
        var overlook = this,
            app = this.app,
            path = this.options.paths.controllers;

        if (!path || !(yield fs.existsAsync(path))) return;

        expressor(app, {
            path: path,
            logger: this.log,

            // wrapper calls method fns with req and res in `this` context
            wrapper: function(fn, method, action) { // jshint ignore:line
                return function(req, res, next) {
                    var obj = {req: req, res: res};
                    obj.__proto__ = action; // jshint ignore:line

                    fn.call(obj).then(function(result) {
                        if (result === false) next();
                    }).catch(function(err) {
                        next(err);
                    });
                };
            },
            hooks: {
                routeBeforePath: function(route) {
                    // co-wrap all generators
                    promisifyAny.generators(route);

                    // add reference to overlook to route
                    route.overlook = overlook;

                    // run initPre function
                    if (route.initPre) route.initPre();
                },
                actionBeforePath: function(action) {
                    // promisify action methods
                    ['get', 'post'].forEach(function(methodName) {
                        if (!action[methodName]) return;
                        action[methodName] = promisifyAny(action[methodName], 0);
                    });

                    // co-wrap all generators
                    promisifyAny.generators(action);

                    // add reference to overlook to action
                    action.overlook = overlook;

                    // run initPre function
                    if (action.initPre) action.initPre();
                }
            }
        });

        // prep routes/actions
        var initRoute = co.wrap(function* initRoute(route) {
            // run init function on route
            if (route.init) yield route.init();

            // prep actions
            yield _.mapValues(route.actions, coSeries(function*(action) {
                // promisify action methods
                ['get', 'post'].forEach(function(methodName) {
                    if (action[methodName]) action[methodName] = promisifyAny(action[methodName], 0);
                });

                // co-wrap all generators
                promisifyAny.generators(action);

                // run init function on action
                if (action.init) yield action.init();
            }));

            // recurse through child routes
            if (route.routes) {
                yield _.mapValues(route.routes, coSeries(function*(route) {
                    yield initRoute(route);
                }));
            }
        });

        yield initRoute(app.expressor.routes);
    },

    expressInit: function() {
        var app = express();

        // strict matching of slashes
        app.set('strict routing', true);

        // static files
        if (this.options.paths.public) app.use(express.static(this.options.paths.public));

        // add all view folders
        app.set('view engine', 'ejs');
        app.set('views', this.viewsPaths);

        return app;
    },

    expressStart: function*(port) {
        var server = http.createServer(this.app);
        yield Promise.promisify(server.listen, server)(port);
        return server;
    }
});
