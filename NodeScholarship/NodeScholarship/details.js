"use strict";
var Io = require("./system/io/file");
var web = require("./system/web/request");
var file = new Io.File();
var req = new web.Request.Get();
var ProductDetails;
(function (ProductDetails) {
    var Parse = (function () {
        function Parse() {
        }
        Parse.prototype.Parse = function (callback) {
            var _this = this;
        };
        return Parse;
    }());
    ProductDetails.Parse = Parse;
    var productDetails = new ProductDetails.Parse();
    productDetails.url =
    ;
})(ProductDetails = exports.ProductDetails || (exports.ProductDetails = {}));
//# sourceMappingURL=details.js.map