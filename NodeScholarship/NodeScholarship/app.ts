
import _ = require('lodash');
import cheerio = require('cheerio');
import request = require('request');
import fs = require('fs');
var sleep = require('sleep');


//var outfilestates = 'states.txt';
var msg = '';
namespace App {
    interface IStateList {
        (getStatesList: any[]): any;
    }

    interface IStateScholarships {
        (getStateScholarships: any[]): any;
    }

    interface IStateScholarshipDetails {
        statename: string;
        getScholarshipByState: (urls: any[], state: string) => void;
    }

    export namespace IO {
        export class File {
            constructor() { }
            append(filePath: string, msg: string) {
                fs.appendFile(filePath, msg, function (err: any) {
                    if (err) {
                        this.append(filePath, msg);
                        return console.log(err);
                    }
                });
            };
        }
    }

    export namespace ScholarShip {
        export class Parser {
            model = {
                stateList: <any[]>[],
                stateScholarships: <any[]>[]

            }
            constructor(public url: string, public pageNumber: number) { }
            getStatesList(callback: IStateList): void {
                var stateUrls: any[] = [];
                request(url, function (error: any, response: any, html: any) {
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
                    };
                });
            }
            getStateScholarships(callback: IStateScholarships): void {
                var subStateUrls: any[] = [];
                var ctr = 0;
                _.each(this.model.stateList, function (item, index) {
                    var url = item.Link;
                    var state = item.State.split(' ')[0];
                    request(url, function (error: any, response: any, html: any) {
                        if (!error && response.statusCode == 200) {
                            var $ = cheerio.load(html);
                            var urls = $('tr[class="odd"]>td').find('a');
                            if (urls.length > 0) {
                                _.each(urls, function (stateChildSubUrl, index) {
                                    ctr++;
                                    var suburl = url + stateChildSubUrl.attribs.href.replace('./', '')
                                    //subStateUrls.push({ State: state, Link: suburl });                                  
                                    sleep.usleep(30000);
                                    console.log(ctr + '- ' + suburl);
                                });
                            }
                            //callback(subStateUrls);                           
                        }
                        else {
                            var msg = 'Error: ' + url + '[' + error + ']: ';
                            console.log(msg);
                        }
                    }, state);

                });

            }
        }
    }
    var pageNumber: number = <number>(process.argv[2] || 0);
    var url = 'https://www.schoolsoup.com/scholarship-directory/state/';
    var app = new App.ScholarShip.Parser(url, pageNumber);
    app.getStatesList((result: any[]): void => {
        if (result.length > 0)
            app.model.stateList = result;

        app.getStateScholarships((statescholarship: any[]): void => {
            app.model.stateScholarships = app.model.stateScholarships.concat(statescholarship);
            

        });

    });

}



