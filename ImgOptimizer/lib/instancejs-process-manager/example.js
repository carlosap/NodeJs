var manager = require('./index.js');
var http = require('http');
var URL = require("url");
var path = require("path");
var fs = require("fs");

manager.startProcessManager({
	monitor:true,
	monitorPort:80


},function(){

	/*var server = http.createServer(function (request, response) {
		var package = require('./package.json');
		response.end('<h1>Test server!</h1><p>Thank you for using InstanceJS Process Manager.</p><p><small>v'+package.version+'</small></p>');
	}).listen(88);*/


	var server = http.createServer(function(request, response) {
		var uri = 'example' + URL.parse(request.url).pathname
			, filename = path.join(process.cwd(), uri);

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
	}).listen(3333);

	return server;
});