// Include Dependency Modules
var connect = require('connect');
var timeout = require('connect-timeout');
var cookieParser = require('cookie-parser');
var http = require('http');
var manager = require('../lib/instancejs-process-manager');
var imageOptimizer = require('./image-optimizer');
var domain = require('domain');
var _ = require('lodash');


function getConfig(){
	var config = require('../config.js');
	var localConfig;

	if (require('fs').existsSync('config.local.js')) {
		localConfig = require('../config.local.js');
	}

	if(localConfig){
		config = _.extend(config, localConfig);
	}

	return config;
}

module.exports = {

	config: getConfig(),

	/**
	 * listen
	 * Call this from your app to start your server.
	 *
	 */
	listen:function(){
		var _this = this;
		if(!_this.config.port){
			throw new Error('When calling listen, a port is required.');
		}

		this.log('Starting HTTP server on port ' + _this.config.port);

		if(this.config.debug){
			this.log('Running in DEBUG mode.', 'warn');
		}

		var app = connect()
			.use(timeout(_this.config.timeout.global))
			.use(cookieParser())
			.use(function(req, res, next) {
				var d = domain.create();
				d.add(req);
				d.add(res);
				d.on('error', function(er) {
					try {
						if(er.code === 'EPIPE'){
							er.extra = '    ImageMagick likely timeout after ' + _this.config.timeout.convert + ' ms\n';
						}
						_this.log(er, 'error');
						_this.respondWithError(res, er);
					} catch (er2) {
						_this.log(er2, 'error');
					}
				});

				d.run(next);
			})
			.use(function(request, response){
				process.nextTick(function(){
					imageOptimizer.createResponse(request, response, _this.config);
				});
			})
			.use(function(err, request, response, next){
				if(err.code === 'ETIMEDOUT'){
					err.extra = '    URL: ' + (request.url || 'unknown') + '\n';
				}
				_this.log(err, 'error');
				_this.respondWithError(response, err);
			});

		this.createServer(_this.config.port, app);
	},

	/**
	 * createServer
	 * This is separate so we can use cluster and can wrap
	 * our connect server in the callback of the process manager.
	 *
	 * @param {int} port
	 * @param {object} app
	 * @returns {object}
	 */
	createServer:function(port, app){
		manager.startProcessManager({
			debug:this.config.debug
		},function(){
			return http.createServer(app).listen(port);
		});
	},

	/**
	 * Logs messages to console, adding a date/time stamp.
	 *
	 * @param stringOrErrorObj String to log or error object
	 * @param level Severity of message (log, warn, error)
	 */
	log:function(stringOrErrorObj,level){
		if(!level || level === 'log'){
			if(this.config.logging.message && stringOrErrorObj){
				console.log(this.dateTime() + ' - ' + stringOrErrorObj);
			}else if(null === stringOrErrorObj){
				console.log('');
			}
		}else if(level === 'warn' && this.config.logging.warn){
			console.warn(this.dateTime() + ' - ' + stringOrErrorObj);
		}else if(level === 'error' && this.config.logging.error){
			var stack = this.config.logging.stack ? "\r\n" + stringOrErrorObj.stack : '';
			var errorString = this.dateTime() + ' - ' + 'Message: ' + stringOrErrorObj.message + stack;
			if(stringOrErrorObj.extra){
				errorString += '\n' + stringOrErrorObj.extra;
			}
			console.error(errorString);
		}
	},


	/**
	 * dateTime
	 * A single method to call to get a date.
	 * We only need to change it here if a specific date format is needed in the application.
	 *
	 * @returns {string}
	 */
	dateTime:function(){
		return (new Date()).toISOString();
	},

	/**
	 * Sends immediate response back with error text, ending current response cycle.
	 * @param response Response object
	 * @param err Error message to write back
	 */
	respondWithError : function(response, err){
		if (response && err) {
			response.writeHead(500, {"Content-Type": "text/plain"});
			response.write(err + "\n");
			response.end();
			return;
		}
	}
};
