"use strict";
var System_WEB_Request = require("../system/web/request");
var _ = require("lodash");
var sleep = require("sleep");
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
            var msg = "";
            req.url = _this.options.url;
            req.Get(function (response) {
                response.$('ul[class*="list left"]>li').each(function (i, element) {
                    var title = response.$(element).find("a").text().trim();
                    var link = response.$(element).find("a").attr("href");
                    var completeUrl = "";
                    if (title !== "" && (title.indexOf("Scholarships") > 0)) {
                        completeUrl = _this.options.url + link.replace("./", "");
                        if (_this.options.pageNumber <= 0)
                            msg = title.split(" ")[0] + "|" + completeUrl + "\r\n";
                        else
                            msg = title.split(" ")[0] + "|" + completeUrl + "?page=" + _this.options.pageNumber + "\r\n";
                        stateUrls.push({ State: title, Link: completeUrl });
                    }
                });
                callback(stateUrls);
            });
        };
        Parser.prototype.getPl = function (callback) {
            var _this = this;
            var subStateUrls = [];
            var ctr = 0;
            var removed = _this.options.stateList.splice(_this.options.stateId, 1);
            _.each(removed, function (item) {
                var url = item.Link;
                var state = item.State.replace(" Scholarships", "");
                _this.options.fileName = "./" + _this.options.outputDirectory + "/" + state + _this.options.stateId + ".json";
                console.log("State Name: " + state);
                console.log("File Name: " + _this.options.fileName);
                req.url = url;
                req.Get(function (response) {
                    var urls = response.$('tr[class="odd"]>td').find("a");
                    if (urls.length > 0) {
                        _.each(urls, function (stateChildSubUrl) {
                            ctr++;
                            var suburl = url + stateChildSubUrl.attribs.href.replace("./", "");
                            subStateUrls.push({ State: state, Link: suburl });
                            sleep.usleep(20000);
                            console.log(ctr + "- " + suburl);
                        });
                    }
                    callback(subStateUrls);
                });
            });
        };
        Parser.prototype.getPd = function (callback) {
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