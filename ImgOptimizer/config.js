module.exports = {
	port:80,
	debug:false,
	/**
	 * Timeout object has three properties.
	 * The global property is the sum of the other timeout values plus a contingency time (~1 second).
	 * The convert property is the time the imagemagick process is awaited.
	 * The urlFetch property is the time to fetch the URL. If this fails, the same timeout is given
	 * to the alternate URL. Thus, the urlFetch is actually half the possible value.
	 * The
	 */
	timeout: {
		global: 15000,
		convert: 8000,
		urlFetch: 3000,
	},
	logging: {
		message: true,
		warn:true,
		error:true,
		stack:true
	},
	test : {
		homeDir: 'spec',
		host: 'http://localhost:8080/',
		timeout: 8000
	},

	/**
	 * Defines the image specification for processing. Each first-level property within imageSpec corresponds to a
	 * URL parameter. Those parameters also have one or more aliases, meaning they are equivalent (e.g. "width"
	 * or "w" can be specified as a query parameter). Each property also has a value which is used by the optimizer,
	 * provided it meets all the following criteria:
	 *  - If required, it is set
	 *  - If numeric, it is within the min/max values
	 *  - If string, it is one of the allowable values or non-empty
	 */
	imageSpec : {

		/**
		 * Optimized images are fetched from a URL. The 'alt' value is used in place if the image returns 404.
		 * The input URL value should be encoded.
		 *
		 * @since 1.1
		 */
		url: {
			aliases: ['url', 'u'],
			required: true,
			value: null
		},

		/**
		 * Alternative image URL if the url parameter returns 404. The default should be an image local to the
		 * Node application (and relative to this file). The input URL value should be encoded. If this alt image is
		 * used because the original image is unavailable, then the same parameters (i.e. width, height, crop, etc)
		 * are applied to the alt image.
		 */
		alt: {
			aliases: ['alt'],
			default: './public/image-not-found.jpg',
			required: false,
			value: null
		},

		/**
		 * When setting width AND/OR height, the image is scaled proportionally to the lesser number. The default null
		 * means the image width, as received from the 'url', will be used.
		 *
		 * @since 1.1
		 */
		width: {
			aliases: ['width', 'w'],
			min: 1,
			max: 3000,
			default: null,
			required: false,
			value: null
		},

		/**
		 * When setting width AND/OR height, the image is scaled proportionally to the lesser number. The default null
		 * means the image width, as received from the 'url', will be used.
		 *
		 * @since 1.1
		 */
		height: {
			aliases: ['height', 'h'],
			min: 1,
			max: 3000,
			default: null,
			required: false,
			value: null
		},

		/**
		 * Specifies the compression quality. This is a fuzzy value depending on the format (lossy vs. loss-less
		 * compression), etc.
		 *
		 * @since 1.1
		 */
		quality : {
			aliases: ['quality', 'q'],
			min: 10,
			max: 100,
			default: 80,
			required: false,
			value: null
		},

		/**
		 * Specifies the image format (file name extension). User agents vary when rendering an <img> element, so only
		 * the most common are supported. Signatures are used to verify the image buffer matches acceptable types.
		 *
		 * For supported image type signatures, refer to https://en.wikipedia.org/wiki/List_of_file_signatures
		 *
		 * @since 1.1
		 */
		format : {
			aliases: ['format', 'f'],
			allowableMime: ['image/jpeg', 'image/jpeg', 'image/png', 'image/gif'],
			defaultMime:    'image/jpeg',
			allowable:     ['jpg',        'jpeg',       'png',       'gif'],
			signature:     [
				'FF D8',                                    // jpg/jpeg
				'89 50 4E 47 0D 0A 1A 0A',                  // png
				'47 49 46 38 37 61', '47 49 46 38 39 61'],  // gif (87a, 89a)
			default:        'jpg',
			required: false,
			valueMime : null,
			value: null
		},

		/**
		 * An image will be cropped when setting width AND/OR height AND crop = 1, when image proportions are different
		 * than what you specify. Example, my image is 200x200, I specify width as 200 but height as 100. In this case
		 * the image will be cropped to vertical center.
		 *
		 * @since 1.1
		 */
		crop : {
			aliases: ['crop', 'c', 'cropped'],
			min: 0,
			max: 1,
			default: 0,
			required: false,
			value: null
		},

		/**
		 * Specifies an expiration header on the response so the user agent can cache the image. All values are
		 * in units of days.
		 *
		 * @since 1.1
		 */
		cache: {
			aliases: ['ttl', 'cache'],
			min: 0,
			max: 50,
			default: 7,
			defaultIf404 : 1,
			required: false,
			value: null
		},

		/**
		 * Specifies the image should skip processing and only add headers specifying the cache duration.
		 *
		 * @since 1.1
		 */
		cacheonly: {
			aliases: ['cacheonly', 'passthrough'],
			min: 0,
			max: 1,
			default: 0,
			required: false,
			value: null
		},
	}
};
