"use strict";
var request = require("request");
var cheerio = require("cheerio");
var Request;
(function (Request) {
    var Get = (function () {
        function Get(url, queryString) {
            if (url === void 0) { url = ""; }
            if (queryString === void 0) { queryString = ""; }
            this.url = url;
            this.queryString = queryString;
        }
        Get.prototype.Get = function (callback) {
            var _this = this;
            request(_this.url, function (error, response, html) {
                _this.$ = cheerio.load(html);
                _this.html = html;
                _this.statusCode = response.statusCode;
                _this.error = error;
                callback(_this);
            });
        };
        return Get;
    }());
    Request.Get = Get;
})(Request = exports.Request || (exports.Request = {}));
//# sourceMappingURL=request.js.map