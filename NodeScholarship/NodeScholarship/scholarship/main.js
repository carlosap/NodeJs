"use strict";
var System_WEB_Request = require("../system/web/request");
var _ = require("lodash");
var req = new System_WEB_Request.Request.Get();
var Main;
(function (Main) {
    var Parser = (function () {
        function Parser() {
            this.options = {
                stateId: 0,
                url: "",
                outputDirectory: "output",
                fileName: "",
                pageNumber: 0,
                stateList: [],
                stateScholarships: []
            };
        }
        Parser.prototype.main = function (callback) {
            var _this = this;
            var stateUrls = [];
            req.url = _this.options.url;
            req.Get(function (response) {
                response.$('ul[class*="list left"]>li').each(function (i, element) {
                    var title = response.$(element).find("a").text().trim();
                    var link = response.$(element).find("a").attr("href");
                    var completeUrl = "";
                    if (title !== "" && (title.indexOf("Scholarships") > 0)) {
                        completeUrl = _this.options.url + link.replace("./", "");
                        if (_this.options.pageNumber > 0)
                            completeUrl = completeUrl + "?page=" + _this.options.pageNumber;
                        stateUrls.push({ State: title, Link: completeUrl });
                    }
                });
                callback(stateUrls);
            });
        };
        Parser.prototype.reIndexData = function (jsonArray) {
            _.each(jsonArray, function (item, index) {
                item.id = index;
            });
            return jsonArray;
        };
        return Parser;
    }());
    Main.Parser = Parser;
})(Main = exports.Main || (exports.Main = {}));
//# sourceMappingURL=main.js.map