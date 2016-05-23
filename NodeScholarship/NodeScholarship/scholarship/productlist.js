"use strict";
var System_IO_Directory = require("../system/io/directory");
var System_WEB_Request = require("../system/web/request");
var _ = require("lodash");
var sleep = require("sleep");
var directory = new System_IO_Directory.Directory();
var req = new System_WEB_Request.Request.Get();
var ProductList = (function () {
    function ProductList(options) {
        this.options = {
            stateId: 0,
            state: "",
            url: "",
            outputDirectory: "output",
            fileName: "",
            pageNumber: 0,
            stateList: [],
            stateScholarships: []
        };
        this.options = options;
    }
    ProductList.prototype.getPl = function (callback) {
        var _this = this;
        var subStateUrls = [];
        var ctr = 0;
        var removed = _this.options.stateList.splice(_this.options.stateId, 1);
        _.each(removed, function (item) {
            var url = item.Link;
            var state = item.State.replace(" Scholarships", "");
            _this.options.outputDirectory = _this.options.outputDirectory + "/" + state;
            directory.createDirectory(_this.options.outputDirectory);
            _this.options.fileName = "./" + _this.options.outputDirectory + "/" + state + "_" + _this.options.pageNumber + ".json";
            _this.options.state = state;
            console.log("State Name: " + state);
            console.log("File Name: " + _this.options.fileName);
            req.url = url;
            req.Get(function (response) {
                var urls = response.$('tr[class="odd"]>td').find("a");
                if (urls.length > 0) {
                    _.each(urls, function (stateChildSubUrl) {
                        ctr++;
                        var suburl = url.replace("?page=" + _this.options.pageNumber, "") + stateChildSubUrl.attribs.href.replace("./", "");
                        subStateUrls.push({ State: state, Link: suburl });
                        sleep.usleep(50000);
                        console.log(ctr + "- " + suburl);
                    });
                }
                callback(subStateUrls);
            });
        });
    };
    return ProductList;
}());
exports.ProductList = ProductList;
//# sourceMappingURL=productlist.js.map