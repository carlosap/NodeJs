"use strict";
var _ = require("lodash");
var cheerio = require("cheerio");
var request = require("request");
var fs = require("fs");
var sleep = require("sleep");
var App;
(function (App) {
    var IO;
    (function (IO) {
        var fileSizeInMegabytes;
        var File = (function () {
            function File() {
            }
            File.append = function (filePath, msg) {
                var _this = this;
                fs.appendFile(filePath, msg, function (err) {
                    if (err) {
                        _this.append(filePath, msg);
                        return console.log(err);
                    }
                });
            };
            ;
            File.read = function (filePath) {
                try {
                    return fs.readFileSync(filePath, "utf8");
                }
                catch (e) {
                    return "";
                }
            };
            ;
            File.exist = function (filePath) {
                try {
                    var stats = fs.lstatSync(filePath);
                    return stats.isFile ? true : false;
                }
                catch (e) {
                    return false;
                }
            };
            File.clearContent = function (filePath) {
                try {
                    if (this.exist(filePath)) {
                        fs.writeFile(filePath, "");
                    }
                    return (File.size(filePath) > 0);
                }
                catch (e) {
                    return false;
                }
            };
            File.size = function (filePath) {
                try {
                    var stats = fs.statSync(filePath);
                    var fileSizeInBytes = stats["size"];
                    return fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
                }
                catch (e) {
                    return 0;
                }
            };
            return File;
        }());
        IO.File = File;
    })(IO = App.IO || (App.IO = {}));
    var pageNumber;
    var url;
    var ScholarShip;
    (function (ScholarShip) {
        var Parser = (function () {
            function Parser(url, pageNumber) {
                this.url = url;
                this.pageNumber = pageNumber;
                this.model = {
                    stateList: [],
                    stateScholarships: []
                };
            }
            Parser.prototype.getStatesList = function (callback) {
                var stateUrls = [];
                var msg = "";
                request(url, function (error, response, html) {
                    if (!error && response.statusCode == 200) {
                        var $ = cheerio.load(html);
                        $('ul[class*="list left"]>li').each(function (i, element) {
                            var title = $(element).find("a").text().trim();
                            var link = $(element).find("a").attr("href");
                            var completeUrl = "";
                            if (title !== "" && (title.indexOf("Scholarships") > 0)) {
                                completeUrl = url + link.replace("./", "");
                                if (pageNumber <= 0)
                                    msg = title.split(" ")[0] + "|" + completeUrl + "\r\n";
                                else
                                    msg = title.split(" ")[0] + "|" + completeUrl + "?page=" + pageNumber + "\r\n";
                                stateUrls.push({ State: title, Link: completeUrl });
                            }
                        });
                        callback(stateUrls);
                    }
                    ;
                });
            };
            Parser.prototype.getStateScholarships = function (callback) {
                var subStateUrls = [];
                var ctr = 0;
                var removed = this.model.stateList.splice(1, 1);
                _.each(removed, function (item, index) {
                    var url = item.Link;
                    var state = item.State.split(" ")[0];
                    request(url, function (error, response, html) {
                        if (!error && response.statusCode == 200) {
                            var $_1 = cheerio.load(html);
                            var urls = $_1('tr[class="odd"]>td').find("a");
                            if (urls.length > 0) {
                                _.each(urls, function (stateChildSubUrl, index) {
                                    ctr++;
                                    var suburl = url + stateChildSubUrl.attribs.href.replace("./", "");
                                    subStateUrls.push({ State: state, Link: suburl });
                                    sleep.usleep(100000);
                                    console.log(ctr + "- " + suburl);
                                });
                            }
                            callback(subStateUrls);
                        }
                        else {
                            var msg = "Error: " + url + "[" + error + "]: ";
                            console.log(msg);
                        }
                    }, state);
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
        ScholarShip.Parser = Parser;
    })(ScholarShip = App.ScholarShip || (App.ScholarShip = {}));
    pageNumber = (process.argv[2] || 0);
    url = 'https://www.schoolsoup.com/scholarship-directory/state/';
    var app = new App.ScholarShip.Parser(url, pageNumber);
    app.getStatesList(function (result) {
        if (result.length > 0)
            app.model.stateList = result;
        app.getStateScholarships(function (statescholarship) {
            var filePath = "./data.json";
            var strJson = "";
            var objScholarship;
            if (IO.File.exist((filePath))) {
                if (IO.File.size(filePath) > 0) {
                    objScholarship = JSON.parse(fs.readFileSync(filePath, "utf8"));
                    objScholarship = objScholarship.concat(statescholarship);
                }
                else {
                    objScholarship = statescholarship;
                }
                objScholarship = app.reIndexData(objScholarship);
                strJson = JSON.stringify(objScholarship, null, 2);
            }
            else {
                objScholarship = app.reIndexData(statescholarship);
                strJson = JSON.stringify(objScholarship, null, 2);
            }
            IO.File.clearContent(filePath);
            IO.File.append(filePath, strJson);
        });
    });
})(App || (App = {}));
//# sourceMappingURL=app.js.map