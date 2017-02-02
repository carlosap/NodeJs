instanceJS Process Manager
===============
## Purpose

Zero downtime deployments and rolling restarts using the NodeJS cluster module.

## How to Install/Use

### Installation is as easy as running:
```bash
npm install instancejs-process-manager --save
```

## Usage

### Simple Example:
```javascript
var manager = require('instancejs-process-manager');
var http = require('http');

manager.startProcessManager(function(){
    var server = http.createServer(function (request, response) {
        response.end("<h1>Test server!</h1><p>Thank you for using InstanceJS Process Manager.</p>");
    }).listen(80);

    console.log('Server instance started');

    return server;
});
```

### Simple Example with options:
```javascript
var manager = require('instancejs-process-manager');
var http = require('http');

manager.startProcessManager({
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
    unresponsiveInterval:    20 * 1000, // 20 seconds
    unresponsiveTimerDelay: 30 * 1000, // 30 seconds

    restartServer:{
        enabled:false,
            port:88
    }
},function(){
    var server = http.createServer(function (request, response) {
        response.end("<h1>Test server!</h1><p>Thank you for using InstanceJS Process Manager.</p>");
    }).listen(80);

    console.log('Server instance started');

    return server;
});
```

### Example Using Express:
```javascript
var manager = require('instancejs-process-manager');
var express = require('express');
var app = express();

app.get('/', function(req, res){
    res.send('<h1>Test server!</h1><p>Thank you for using InstanceJS Process Manager.</p>');
});

manager.startProcessManager(function(){
    var server = app.listen(3333, function() {
        console.log('Listening on port %d', server.address().port);
    });

    return server;
});
```
## Options

Below are default options which can be overridden when starting your instance.
```javascript
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
unresponsiveInterval    20 * 1000, // 20 seconds
unresponsiveTimerDelay: 30 * 1000, // 30 seconds

restartServer:{
	enabled:false,
	port:88
}
```

## Signals

While the cluster manager is running, you can send signals.

*Trigger a rolling restart
```bash
kill -HUP `cat instancejspm.pid`
```

*Trigger a graceful shutdown
```bash
kill -TERM `cat instancejspm.pid`
```