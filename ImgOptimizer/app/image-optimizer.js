var Qs = require('qs');
var URL = require('url');
var fs = require('fs');
var mkdirp = require("mkdirp");
// MMC - replacing with sharp
//var imageMagick = require('../lib/node-imagemagick');
var sharp = require('sharp');
var http = require('http');
var requestManager = require('request');
var PATH = require('path');
var _ = require('lodash');
var crypto = require('crypto');

module.exports = {

	/**
	 * createResponse
	 *
	 * Makes request to get an image, will use alternate if supplied
	 * if no image is found, will return a default or user supplied
	 * "not found" image.
	 *
	 * @param request
	 * @param response
	 * @param config configuration object
	 * @returns true on success
	 *
	 * @since 1.1
	 */
	createResponse: function (request, response, config) {
		var _this = this;
		var url = URL.parse(request.url);
		var query = Qs.parse(url.query);

		// Make sure the spec is available
		// -------------------------------

		if(!config.imageSpec) {
			respondWithError(response, "Configuration does not have an imageSpec.");
			return false;
		}

		// Validate the incoming query parameters
		// --------------------------------------

		// The spec will be manipulated and stored as the model
		var model = _.clone(config.imageSpec, true);

		model.url.aliases.forEach(function(alias, index, array){
			var prop = query[alias] || query[alias.toLowerCase()] || query[alias.toUpperCase()];
			if(prop) {
				model.url.value = prop;
			}
		});

		model.alt.aliases.forEach(function(alias, index, array){
			var prop = query[alias] || query[alias.toLowerCase()] || query[alias.toUpperCase()];
			if(prop) {
				model.alt.value = prop;
			}
		});

		var altImageValid = true;
		if(!model.alt.value){
			// Check if there's a fallback image then fail later - this is so we can fail with a local image
			// or fail hard with a 500 error.
			if(model.alt.required && (model.alt.value === null)) {
				altImageValid = false;
			}
			model.alt.value = model.alt.default;
		}

		// Clean width input - but don't do follow-up checks to see if the width is required since it's not
		// feasible to *know* the image width ahead of time.
		model.width.aliases.forEach(function(alias, index, array){
			var prop = query[alias] || query[alias.toLowerCase()] || query[alias.toUpperCase()];
			if(prop) {
				model.width.value = cleanQueryValue(prop, model.width.min, model.width.max, model.width.default);
			}
		});

		// Clean height input - but don't do follow-up checks to see if the height is required since it's not
		// feasible to *know* the image height ahead of time.
		model.height.aliases.forEach(function(alias, index, array){
			var prop = query[alias] || query[alias.toLowerCase()] || query[alias.toUpperCase()];
			if(prop) {
				model.height.value = cleanQueryValue(prop, model.height.min, model.height.max, model.height.default);
			}
		});

		// Clean quality and, again, ignore required checks for now since it's not a hard requirement.
		model.quality.aliases.forEach(function(alias, index, array){
			var prop = query[alias] || query[alias.toLowerCase()] || query[alias.toUpperCase()];
			if(prop) {
				model.quality.value = cleanQueryValue(prop, model.quality.min, model.quality.max, model.quality.default);
			}
		});

		if(!model.quality.value){
			model.quality.value = model.quality.default;
		}

		// Ensure formats are acceptable
		model.format.aliases.forEach(function(alias, index, array){
			var prop = query[alias] || query[alias.toLowerCase()] || query[alias.toUpperCase()];
			if(prop) {
				model.format.value = cleanEnum(prop, model.format.allowable, model.format.default);
				// We need the index because the cleaned result may not be the current loop index
				model.format.valueMime = model.format.allowableMime[_.indexOf(model.format.allowable, model.format.value)];
			}
		});

		if(!model.format.value){
			model.format.value = model.format.default;
			model.format.valueMime = model.format.allowableMime[_.indexOf(model.format.allowable, model.format.value)];
		}

		model.crop.aliases.forEach(function(alias, index, array){
			var prop = query[alias] || query[alias.toLowerCase()] || query[alias.toUpperCase()];
			if(prop) {
				model.crop.value = cleanQueryValue(prop, model.crop.min, model.crop.max, model.crop.default);
			}
		});

		if(!model.crop.value) {
			model.crop.value = model.crop.default;
		}

		model.cache.aliases.forEach(function(alias, index, array){
			var prop = query[alias] || query[alias.toLowerCase()] || query[alias.toUpperCase()];
			if(prop) {
				model.cache.value = cleanQueryValue(prop, model.cache.min, model.cache.max, model.cache.default);
			}
		});

		if(model.cache.value === null) {
			model.cache.value = model.cache.default;
		}

		model.cacheonly.aliases.forEach(function(alias, index, array){
			var prop = query[alias] || query[alias.toLowerCase()] || query[alias.toUpperCase()];
			if(prop) {
				model.cacheonly.value = cleanQueryValue(prop, model.cacheonly.min, model.cacheonly.max, model.cacheonly.default);
			}
		});

		if(!model.cacheonly.value) {
			model.cacheonly.value = model.cacheonly.default;
		}

		var urlImageInvalid = (model.url.required && (model.url.value === null) );
		if(urlImageInvalid && !altImageValid) {
			// Fail hard (500)
			respondWithError(response, "The 'url' parameter is required but missing. The fallback 'alt' image is also required but missing.");
			return false;
		} else if(urlImageInvalid && altImageValid) {
			// Fail with local "no image"
			// Perhaps it's *slightly* faster to fail earlier but failing here ensures model is fully validated
			sendNoImage(request, response, model);
			return false;
		}


		// Use query parameters and process image
		// --------------------------------------

		// Format new image path
		var imageUrl = model.url.value;
		var imageName = _this.imageName = PATH.normalize(model.url.value.replace(/http(s)?\:\/\//g, ''));


		/**
		 * getImage
		 *
		 * A recursive method to return the origin, alternate or default
		 * not found image.
		 *
		 * @param {string} imageUrl
		 * @param {boolean|undefined} doNotOptimize
		 */
		function getImage(imageUrl, doNotOptimize, config) {
			makeImageRequest(imageUrl, model, config, function (exists, imageData) {
				if (exists) {

					if (doNotOptimize) {
						end(null, request, response, imageData, imageName, model);
					} else {
						optimizeImage(imageData, model, config, function (err, stdout) {
							end(err, request, response, stdout, imageName, model);
						});
					}

				} else {
					// Make sure the alt image is a proper URL, and if not then fallback to "no image"
					var validUrl = isValidUrl(model.alt.value);

					if (validUrl) {
						// Re-create the query and request and use the cleaned query values
						var querystring = '';
						var sep = '';
						var host = request.headers['x-host'] || request.headers['host'];
						for (var key in model) {
							if (model.hasOwnProperty(key) && key && key !== 'url') {
								sep = sep ? '&' : '?';
								if(model[key].value){
									querystring += sep + (key === 'alt' ? 'url' : key) + '=' + encodeURIComponent(model[key].value);
								}
							}
						}

						// TODO : Doesn't this presume the host is unsecured?
						requestManager.get('http://' + host + querystring, {timeout: config.timeout.urlFetch}).pipe(response);

					} else {
						sendNoImage(request, response, model);
					}
				}
			});
		}

		getImage(imageUrl, !!model.cacheonly.value, config);
	},

}

/**
 * makeImageRequest
 *
 * Use HTTP module to make a get request for the image
 * supplied.
 *
 * @param imageUrl
 * @param cb
 */
var makeImageRequest = function (imageUrl, model, config, cb) {
	var _this = this;
	var r;
	var settings = {};

	settings = _.extend(settings, {
		strictSSL: false,//important to set to false for it to work with fiddler
		'followAllRedirects': true,//follow all redirects even non-GET
		encoding: null//(!!DO NOT CHANGE UNLESS YOU KNOW WHAT YOU ARE DOING) null will make it return a buffer which is what we want because on windows messes it up otherwise
	});

	// Quickly return if the URL is invalid
	if(!isValidUrl(imageUrl)) {
		cb(false);
		return;
	}

	r = requestManager.defaults(settings);

	// The request module calls url.parse which fixes backslashes
	r(imageUrl.replace(/\\/g, '%5C')).on('response', function (response) {

		/**
		 * Due to one of our clients not returning the proper image
		 * headers, we also have to accept 'plain/text'
		 */
		var isGoodHttpStatus = (response.statusCode == 200);
		var isImageOrPoorlyMimeTypedImage = (response.headers['content-type'].indexOf('image') > -1 || response.headers['content-type'].indexOf('text/plain') > -1);
		if ( (isGoodHttpStatus && isImageOrPoorlyMimeTypedImage) || model.cacheonly.value) {
			var imageData = '';
			response.setEncoding('binary');
			response.on('data', function (chunk) {
				imageData += chunk;
			});
			response.on('end', function () {
				cb(true, imageData);
			});
		} else {
			cb(false);
		}

	}).on('error', function (err) {
		cb(false);
	});
};


/**
 * optimizeImage
 *
 * Use the Sharp module to compress and resize the image.
 * If debug is enabled, the image will be saved on the local disc.
 *
 * @param imageData Source image data to optimize
 * @param model Image spec model
 * @param config Global configuration object
 * @param cb Callback
 */
var optimizeImage = function (imageData, model, config, cb, converted) {
	var _this = this;

	if(!verifiedSignature(imageData, config)){
		return cb(new Error('Unknown file signature'));
	}
	else {
        var bufferToMod = sharp(new Buffer(imageData, 'binary'))
            .resize(model.width.value, model.height.value);

        if(model.crop.value){
        	bufferToMod.crop(sharp.gravity.center);
		}

		if(model.quality.value != 100){
        	bufferToMod.quality(model.quality.value);
		}

		if( (model.format.value === 'jpg') || (model.format.value === 'jpeg') ){
			bufferToMod.jpeg();
		} else if(model.format.value == 'png'){
            bufferToMod.png();
		} else if(model.format.value == 'gif'){
			// GIF isn't supported!
            bufferToMod.png();
		}

		// Now convert to a buffer and callback
		bufferToMod.toBuffer(cb)
	}
};

/**
 * Verifies the file signature associated with an "image" to ensure they match
 * support file types that are actually images.
 *
 * @param imageData image buffer
 * @param config configuration object with allowable mime types
 * @return true if the actual bytes match our allowable types
 */
var verifiedSignature = function(imageData, config){
	var verified = false;

	// Get supported type signatures
	var types = config.imageSpec.format.signature.forEach(function(sig){

		if(!verified){

			// Get values of signature
			var byteValues = sig.split(' ');

			// Ensure the image is at least as long as the number of signature bytes
			if(imageData && imageData.length >= byteValues.length){

				// Just grab as many bytes as the signature
				var imageByteValues = new Buffer(imageData.slice(0, byteValues.length), 'ascii');
				var matchSig = true;

				// Compare against the signature
				byteValues.forEach(function(byteString, index){
					var sigByteValue = new Buffer(byteString, 'hex')[0];
					var imgByteValue = imageByteValues[index];
					matchSig = matchSig && (sigByteValue === imgByteValue);
				});
				verified = matchSig;
			}

		}
	});

	return verified;
}


/**
 * sendNoImage
 *
 * @param request
 * @param response
 */
var sendNoImage = function (request, response, model) {
	var fileName = model.alt.default;
	fs.readFile(fileName, "binary", function (err, imageData) {
		end(err, request, response, imageData, fileName, model);
	});
};


/**
 * End server response.
 *
 * @param err Error, if any
 * @param request
 * @param response
 * @param imageData
 * @param fileName
 * @param model
 */
var end = function (err, request, response, imageData, fileName, model) {

	if(response && response.finished) {
		// It's possible the socket timed out before the image could be processed,
		// so don't attempt to send another response.
		return;
	}

	var expires = model.cache.value;

	// It was an unverified file type. Since there are semi-known exploits
	// around file signatures, it's probably best not to give away the actual
	// error message.
	if(err && err.message === 'Unknown file signature'){
		sendNoImage(request, response, model);
		return;
	}

	if (err) {
		respondWithError(response, err);
		return;
	}

	var maxAge = expires * 24 * 60 * 60;

	response.setHeader("Pragma", "public");
	response.setHeader("Cache-Control", "public, max-age=" + maxAge); //  max-age=604800
	response.setHeader("Vary", "Accept-Encoding");
	if(expires) {
		response.setHeader("expires", expires + "d");
	}

	// The binary blob is potentially more reliable but probably not worth the CPU cost
	var dataToHash = (model.url.value || "") +
		'#' + (model.format.value || "") +
		'#' + (model.width.value || '0') +
		'#' + (model.height.value || '0') +
		'#' + (model.quality.value || '0');
	var shasum = crypto.createHash('sha256');
	shasum.update(dataToHash);
	var etag =  shasum.digest('base64') || "";
	if(etag){
		response.setHeader("ETag", etag);
	}
	response.writeHead(200, {'Content-Type': model.format.valueMime || model.format.defaultMime});
	response.write(imageData, "binary");
	response.end();
};

/**
 * Sends immediate response back with error text, ending current response cycle.
 * @param response Response object
 * @param err Error message to write back
 */
var respondWithError = function(response, err){
	if (response && err) {
		response.writeHead(500, {"Content-Type": "text/plain"});
		response.write(err + "\n");
		response.end();
		return;
	}
};

/**
 * Tests if a query value is a valid integer, within the provided range [min,max], and if
 * it does not pass the tests, returns the default value.
 *
 * @param input string or number input
 * @param minValue minimum value of integer (inclusive)
 * @param maxValue maximum value of integer (inclusive)
 * @param defaultValue default value to return if tests fail
 * @returns An integer in range [min,max] or default
 */
var cleanQueryValue = function cleanValue(input, minValue, maxValue, defaultValue){
	var intReg = /^\d+$/;
	if(input && input.length && input.match(intReg))
	{
		var inputNum = parseInt(input);
		if( (inputNum >= minValue) && (inputNum <= maxValue) )
		{
			return inputNum;
		}
	}

	return defaultValue;
};

/**
 * Tests if a query value is a valid string within a collection of values. If it does
 * not pass checks, the default value is returned.
 *
 * @param input input string or object
 * @param values set of valid values
 * @param defaultValue default value to use if no matches are found
 * @returns An object within the result value and optionally an error value, if the fallback default was used
 */
var cleanEnum = function(input, values, defaultValue){

	if(input && input.length)
	{
		var inputString = input.trim().toLowerCase();
		if(_.contains(values, inputString))
		{
			return inputString;
		}
	}

	return defaultValue;
};

/**
 * Tests if a URL is valid. This is a simplistic check to prevent unnecessary
 * network traffic for blatant URI garbage.
 * @param inputUrl
 */
var isValidUrl = function(inputUrl) {
	var parsed = URL.parse(inputUrl, false);
	return ( (parsed.hostname !== null) && (parsed.protocol !== null) && (parsed.path !== null) );
}