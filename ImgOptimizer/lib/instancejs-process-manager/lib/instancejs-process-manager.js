var os = require('os');
var fs = require('fs');
var path = require("path");
var URL = require("url");
var util = require('util');

module.exports = {
	startProcessManager:function(options, callback){
		var _this = this;

		if(typeof options === 'function'){
			callback = options;
			options = {};
		}

		if(!callback){
			console.error('A callback is required to run.');
			return;
		}

		this.options = options = this.deepExtend({

			monitor:false,
			monitorPort:3333,
			debug:false,
			logs: {
				message:true,
				warn:true,
				error:true,
				stack:true
			},

			maxWorkers:0,
			overrideNumCPU:false,
			pidFile:'instancejspm.pid',

			// Rolling restart interval
			// IMPORTANT: This must be more than the disconnectedTimeout
			recycleTime: 30 * 60 * 1000, // 30 minutes,

			// Set how long to wait for a disconnected worker to finish
			// any open connections before sending the kill message.
			disconnectedTimeout:    40 * 1000, // 40 seconds

			// Unresponsive workers
			heartbeatInterval:       7 * 1000, //  7 seconds
			unresponsiveTimeOffset: 10 * 1000, // 10 seconds
			unresponsiveInterval:   20 * 1000, // 20 seconds
			unresponsiveTimerDelay: 30 * 1000, // 30 seconds

			restartServer:{
				enabled:false,
				port:88
			}
		}, options);

		process.argv.forEach(function(val, index, array) {
			//console.log(index + ': ' + val);

			switch(val){
				case '--debug':
				case '-d':
					options.debug = true;
					break;
				case '-v':
				case '--version':
					try{
						var version = require('../package.json');
						console.log('instanceJs Process Manager v'+version.version);
					}catch(err){
						_this.log(err, 'error');
					}
					options.help = true;
					break;
				case '--help':
					console.log('');
					console.log('');
					console.log('-------------------------------------');
					console.log('instanceJS Process Manager cli help');
					console.log('-------------------------------------');
					console.log('');
					console.log('Commands:');
					console.log('');
					console.log(' -d,  --debug    // Starts a single instance of your server without using cluster.');
					console.log(' -v,  --version  // Prints current version');
					options.help = true;
					break;
			}
		});

		if(options.help){
			return false;
		}

		if(options.debug){
			_this.log('Starting instanceJS Process Manager in DEBUG mode.');
			return callback && callback();
		}





		/**
		 *  cluster.isMaster
		 *
		 *  True if the process is a master. This is determined by
		 *  the process.env.NODE_UNIQUE_ID. If process.env.NODE_UNIQUE_ID
		 *  is undefined, then isMaster is true.
		 */
		var cluster = require('cluster');

		if (cluster.isMaster) {
			var numCPUs = require('os').cpus().length;
			var http = require('http');
			var managedProcesses = {};
			var disconnectedProcesses = {};

			_this.log('Process ID: ' + process.pid);
			_this.log('Total CPUs: ' + numCPUs);

			numCPUs = numCPUs > 2 ? numCPUs - 1 : 2;

			if(options.maxWorkers > 0 && (options.maxWorkers < numCPUs || options.overrideNumCPU)){
				numCPUs = options.maxWorkers;
			}

			// Fork workers based on number of CPU's.
			// While developing you may want to manually fork
			// only one worker.
			for (var i = 0; i < numCPUs; i++) {
				clusterFork();
			}

			_this.log('Total Workers: ' + Object.keys(cluster.workers).length);

			// defaults to instancejspm.pid
			_this.createPIDFile(options.pidFile);

			if(options.monitor){
				var startTime = new Date().getTime();
				var connections = [];
				var activeConnections = {
					seconds:[],
					minute:[],
					hour:[]
				};
				var mem = {};

				var server = http.createServer(function(request, response) {
					var uri = __dirname + '/../monitor' + URL.parse(request.url).pathname
						, filename = path.normalize(uri);

					fs.exists(filename, function(exists) {
						if(!exists) {
							response.writeHead(404, {"Content-Type": "text/plain"});
							response.write("404 Not Found\n");
							response.end();
							return;
						}
						if (fs.statSync(filename).isDirectory()) filename += '/index.html';

						fs.readFile(filename, "binary", function(err, file) {
							if(err) {
								response.writeHead(500, {"Content-Type": "text/plain"});
								response.write(err + "\n");
								response.end();
								return;
							}

							response.writeHead(200);
							response.write(file, "binary");
							response.end();
						});
					});
				}).listen(options.monitorPort);
				var io = require('socket.io').listen(server, {log:false});
				io.configure(function () {
					io.set('authorization', function (handshakeData, callback) {
						if (handshakeData.xdomain) {
							callback('Cross-domain connections are not allowed');
						} else {
							callback(null, true);
						}
					});
				});

				setInterval(function(){
					for(i = 0; i < activeConnections.hour.length; i++){
						if(activeConnections.hour[i] && activeConnections.hour[i] < (new Date().getTime() - (60 * 60 * 1000))){
							activeConnections.hour.splice(i, 1);
						}
					};

				}, 60 * 60 * 1000);

				setInterval(function(){
					for(i = 0; i < activeConnections.minute.length; i++){
						if(activeConnections.minute[i] && activeConnections.minute[i] < (new Date().getTime() - (60 * 1000))){
							activeConnections.minute.splice(i, 1);
						}
					};

				}, 60 * 1000);


				setInterval(function(){
					for(i = 0; i < activeConnections.seconds.length; i++){
						if(activeConnections.seconds[i] && activeConnections.seconds[i] < (new Date().getTime() - 5000)){
							activeConnections.seconds.splice(i, 1);
						}
					};
				}, 5000);

				setInterval(function(){
					if(connections.length > 10){
						connections.splice(10, Number.MAX_VALUE);
					}

					io.sockets.emit('update',{
						connections:connections,
						active:{
							seconds: activeConnections.seconds.length,
							minute: activeConnections.minute.length,
							hour: activeConnections.hour.length
						},
						managedProcesses:managedProcesses,
						server: {
							master:{
								pid: process.pid,
								timestamp: startTime,
								mem:process.memoryUsage()
							},
							startTime: startTime,
							maxWorkers: numCPUs,
							uptime:os.uptime(),
							loadavg:os.loadavg(),
							totalmem:os.totalmem(),
							freemem:os.freemem(),
							mem:mem,
							network:os.networkInterfaces()
						}
					});
				}, 1000);
			}


			/**
			 *  cluster.fork([env])
			 *
			 *  @param Object env   Key/value pairs to add to child process environment.
			 *  @return Worker object
			 *
			 *  Spawn a new worker process. This can only be
			 *  called from the master process.
			 */
			function clusterFork(){
				var workerInstance = cluster.fork();
				cluster.workers[workerInstance.id].on('message', processHandler);
				managedProcesses[workerInstance.id] = {
					id: new Date().getTime(),
					mem:{heapTotal:0}
				};
			}

			function processHandler(message) {
				if (message.action === 'manageProcess') {
					managedProcesses[message.id] = {
						timestamp: new Date().getTime(),
						mem:message.mem
					};
				}else if (options.monitor && message.action === 'updateConnections'){
					connections.unshift(message.info);
					activeConnections.seconds.push(message.info.time);
					activeConnections.minute.push(message.info.time);
					activeConnections.hour.push(message.info.time);
				}
			}

			function doRollingRestart(){
				if(Object.keys(managedProcesses).length < numCPUs){
					for (var x = 0; i < Object.keys(managedProcesses).length - numCPUs; x++) {
						clusterFork();
					}
				}

				var i = 0;
				_this.eachWorkers(cluster.workers, function(worker) {
					if(i < numCPUs){
						clusterFork();
					}
					disconnectedProcesses[worker.id] = true;
					worker.send('disconnect');
					i++;
				});
			}

			/**
			 *  Event: 'exit'
			 *  @param object worker
			 *  @param Number code      The exit code, if it exited normally.
			 *  @param String signal    The name of the signal (eg. 'SIGHUP') that caused the process to be killed.
			 *
			 *  When any of the workers die the cluster module will
			 *  emit the 'exit' event. This can be used to restart
			 *  the worker by calling fork() again.
			 */
			cluster.on('disconnect', function(worker, code, signal) {
				delete managedProcesses[worker.id];
				if(disconnectedProcesses[worker.id]){
					delete disconnectedProcesses[worker.id];
				}else{
					clusterFork();
				}
			});

			/**
			 * Kill worker if it stops responding
			 */
			setInterval(function(){
				var timestamp = new Date().getTime() - options.unresponsiveTimeOffset;

				Object.keys(cluster.workers).forEach(function(id) {
					if(managedProcesses[id].timestamp < timestamp){
						var workerInstance = cluster.workers[id];
						workerInstance.kill();
						delete managedProcesses[id];
						_this.log('Worker ID ' + id + ' reached the unresponsiveInterval (' + options.unresponsiveInterval / 1000 + 's) and was killed.');
					}
				});
			}, options.unresponsiveInterval);

			/**
			 * Recycle worker processes on configuration schedule
			 *
			 */
			setInterval(function () {
				_this.log(null);
				_this.log('Scheduled recycle triggered.');
				_this.log('Total Workers: ' + Object.keys(cluster.workers).length);
				_this.log('Total Managed Processes: ' + Object.keys(managedProcesses).length);

				doRollingRestart();
			}, options.recycleTime);

			/**
			 * Start a second server so you can manually trigger a rolling restart.
			 * This can run on a port available internally only so you can call for
			 * example: curl localhost:88/restart
			 *
			 */
			if(options.restartServer.enabled && options.restartServer.port){
				// Configure our HTTP server to respond only on port 88.
				http.createServer(function (request, response) {
					if (request.url === '/restart') {
						_this.log('Cluster workers manually restarted.');
						doRollingRestart();
						response.end("<p><strong>Restart Server</strong></p><pre>All running cluster workers are being<br>disconnected and new ones are being started.<br><br><small style=\"color:grey\">"+_this.dateTime()+"</small></pre>");
					} else {
						response.end("404");
					}
				}).listen(options.restartServer.port);

				_this.log('Rolling restart server started on port ' + options.restartServer.port + '. Trigger by going to http://localhost:' + options.restartServer.port + '/restart');
			}


			process.on('SIGHUP',function() {
				// graceful restart
				_this.log('Received SIGHUP, gracefully restarting workers.');
				doRollingRestart();
				process.stdout.write('Rolling restart has been triggered.\n');
			});

			process.on('SIGTERM',function() {
				_this.log('Received SIGTERM, sending exit message.');
				_this.eachWorkers(cluster.workers, function(worker) {
					worker.send('disconnect');
				});
				cluster.disconnect();
				process.exit(0);
			});

			process.on('SIGINT',function() {
				_this.log('Received SIGINT, exiting.');
				process.exit(0);
			});

			// Doesn't work on OSx
			/*process.on('SIGSTOP',function() {
			 _this.log('Received SIGSTOP, sending exit message.');
			 process.send('exit');
			 });*/

			process.on('uncaughtException', function(err){
				err.message = 'Master: ' + err.message;
				_this.log(err, 'error');
				process.exit(1);
			});

			process.on('exit',function(msg) {
				_this.eachWorkers(cluster.workers, function(worker) {
					worker.send('exit');
				});
				_this.deletePIDFile(options.pidFile);
				_this.log('Shutting down master.');
				process.exit(0);
			});

			_this.log('InstanceJS Process Manager started.');

		} else {

			var server = callback && callback();

			if(options.monitor && server){
				server.on('request', function(request){
					process.send({
						action: 'updateConnections',
						info: {
							ip: request.headers['x-forwarded-for'] || request.connection.remoteAddress,
							userAgent: request.headers['user-agent'],
							referer: request.headers.referer,
							url: request.url,
							time: new Date().getTime(),
							timestamp: new Date()
						}
					});
				});
			}

			var workerInterval = setInterval(function(){
				process.send({
					action: 'manageProcess',
					id: cluster.worker.id,
					mem:process.memoryUsage()
				});
			}, options.heartbeatInterval);
			var isDisconnected = false;

			process.on('uncaughtException', function(err){
				_this.log(err, 'error');
				process.exit(1);
			});

			// Listen for the message to disconnect the current worker.
			process.on('message', function (msg) {
				if(msg === 'exit'){

					console.log('Exit code received.');
					process.exit(0);

				}else if (msg === 'disconnect') {

					if(isDisconnected){
						return;
					}

					clearInterval(workerInterval);

					if(server){
						try{
							server.close();
						}catch(err){
							_this.log(err, 'error');
						}
					}

					/**
					 *  worker.disconnect()
					 *
					 *  When calling this function the worker will no longer accept new
					 *  connections, but they will be handled by any other listening worker.
					 *  Existing connection will be allowed to exit as usual. When no more
					 *  connections exist, the IPC channel to the worker will close allowing
					 *  it to die graceful. When the IPC channel is closed the disconnect event
					 *  will emit, this is then followed by the exit event, there is emitted
					 *  when the worker finally die.
					 *
					 */
					cluster.worker.disconnect();
					isDisconnected = true;

					// make sure we close down within 30 seconds
					var killTimer = setTimeout(function () {

						_this.log('Exiting worker ID ' + cluster.worker.id + ' after waiting ' + options.unresponsiveTimerDelay/1000 + ' seconds.');

						/**
						 *  process.exit([code])
						 *
						 *  Ends the process with the specified code. If omitted,
						 *  exit uses the 'success' code 0.
						 */
						process.exit(0);
					}, options.unresponsiveTimerDelay);

					/**
					 *  unref()
					 *
					 *  The opaque value returned by setTimeout and setInterval
					 *  also has the method timer.unref() which will allow you
					 *  to create a timer that is active but if it is the only
					 *  item left in the event loop won't keep the program running.
					 *  If the timer is already unrefd calling unref again will
					 *  have no effect.
					 *
					 *  In the case of setTimeout when you unref you create a separate
					 *  timer that will wakeup the event loop, creating too many of
					 *  these may adversely effect event loop performance -- use wisely.
					 */
					killTimer.unref();
				}
			});
			return server;
		}
	},
	dateTime:function(){
		return (new Date()).toISOString();
	},
	extend:function(a,b){
		for(var prop in b){
			if(!(prop === "constructor" && a === window)){
				if(b[ prop ] === undefined) {
					delete a[prop];
				}else{
					a[prop] = b[prop];
				}
			}
		}
		return a;
	},
	deepExtend:function(destination, source) {
		for (var property in source) {
			if (source[property] && source[property].constructor &&
				source[property].constructor === Object) {
				destination[property] = destination[property] || {};
				arguments.callee(destination[property], source[property]);
			} else {
				destination[property] = source[property];
			}
		}
		return destination;
	},
	log:function(string,type){
		if(!type || type === 'log'){
			if(this.options.logs.message && string){
				console.log(this.dateTime() + ' - ' + string);
			}else if(null === string){
				console.log('');
			}
		}else if(type === 'warn' && this.options.logs.warn){
			console.warn(this.dateTime() + ' - ' + string);
		}else if(type === 'error' && this.options.logs.error){
			var stack = this.options.logs.stack ? "\r\n" + string.stack : '';
			console.error(this.dateTime() + ' - ' + 'uncaughtException: ' + string.message + stack, 'error');
		}
	},
	createPIDFile:function(file) {
		var _this = this;
		try {
			fs.writeFileSync(file, process.pid + "\n");
			_this.log("created pid_file: "+file);
		} catch (err) {
			_this.log(err, 'error');
		}
	},
	deletePIDFile:function(file) {
		var _this = this;
		try {
			fs.unlinkSync(file);
		} catch (err) {
			_this.log(err, 'error');
		}
	},
	eachWorkers:function(workers, callback) {
		Object.keys(workers).map (function(pid) {
			var worker = workers[ pid ];
			callback(worker);
		});
	}
};

