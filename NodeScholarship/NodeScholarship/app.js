"use strict";
var _ = require('lodash');
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var sleep = require('sleep');
//var outfilestates = 'states.txt';
var msg = '';
var App;
(function (App) {
    var IO;
    (function (IO) {
        var File = (function () {
            function File() {
            }
            File.prototype.append = function (filePath, msg) {
                fs.appendFile(filePath, msg, function (err) {
                    if (err) {
                        this.append(filePath, msg);
                        return console.log(err);
                    }
                });
            };
            ;
            return File;
        }());
        IO.File = File;
    })(IO = App.IO || (App.IO = {}));
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
                request(url, function (error, response, html) {
                    if (!error && response.statusCode == 200) {
                        var $ = cheerio.load(html);
                        $('ul[class*="list left"]>li').each(function (i, element) {
                            var title = $(element).find('a').text().trim();
                            var link = $(element).find('a').attr('href');
                            var completeUrl = '';
                            if (title != '' && (title.indexOf('Scholarships') > 0)) {
                                completeUrl = url + link.replace('./', '');
                                if (pageNumber <= 0)
                                    msg = title.split(' ')[0] + '|' + completeUrl + '\n';
                                else
                                    msg = title.split(' ')[0] + '|' + completeUrl + '?page=' + pageNumber + '\n';
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
                _.each(this.model.stateList, function (item, index) {
                    var url = item.Link;
                    var state = item.State.split(' ')[0];
                    request(url, function (error, response, html) {
                        if (!error && response.statusCode == 200) {
                            var $ = cheerio.load(html);
                            var urls = $('tr[class="odd"]>td').find('a');
                            if (urls.length > 0) {
                                _.each(urls, function (stateChildSubUrl, index) {
                                    ctr++;
                                    var suburl = url + stateChildSubUrl.attribs.href.replace('./', '');
                                    //subStateUrls.push({ State: state, Link: suburl });                                  
                                    sleep.usleep(30000);
                                    console.log(ctr + '- ' + suburl);
                                });
                            }
                        }
                        else {
                            var msg = 'Error: ' + url + '[' + error + ']: ';
                            console.log(msg);
                        }
                    }, state);
                });
            };
            return Parser;
        }());
        ScholarShip.Parser = Parser;
    })(ScholarShip = App.ScholarShip || (App.ScholarShip = {}));
    var pageNumber = (process.argv[2] || 0);
    var url = 'https://www.schoolsoup.com/scholarship-directory/state/';
    var app = new App.ScholarShip.Parser(url, pageNumber);
    app.getStatesList(function (result) {
        if (result.length > 0)
            app.model.stateList = result;
        app.getStateScholarships(function (statescholarship) {
            app.model.stateScholarships = app.model.stateScholarships.concat(statescholarship);
        });
    });
})(App || (App = {}));
//# sourceMappingURL=app.js.map