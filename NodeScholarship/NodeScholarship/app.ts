import _ = require("lodash");
import cheerio = require("cheerio");
import request = require("request");
import fs = require("fs");
var sleep = require("sleep");
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
        var fileSizeInMegabytes: number;
        export class File {
            constructor() { }
            static append(filePath: string, msg: string) {
                fs.appendFile(filePath, msg, (err: any) => {
                    if (err) {
                        this.append(filePath, msg);
                        return console.log(err);
                    }
                });
            };
            static read(filePath: string) {
                try {
                    return fs.readFileSync(filePath, "utf8");
                } catch (e) {
                    return "";
                }                 
            };
            static exist(filePath: string) {
                try {
                    const stats: any = fs.lstatSync(filePath);
                    return stats.isFile ? true : false;
                } catch (e) {
                    return false;
                }
            }
            static clearContent(filePath: string) {
                try {
                    if (this.exist(filePath)) {
                        fs.writeFile(filePath, "");                        
                    }
                    return (File.size(filePath) > 0);
                } catch (e) {
                    return false;
                }
            }
            static size(filePath: string) {
                try {
                    const stats = fs.statSync(filePath);
                    const fileSizeInBytes = stats["size"];
                    return fileSizeInMegabytes = fileSizeInBytes / 1000000.0;                   
                } catch (e) {
                    return 0;
                } 
            }
        }
    }
    var pageNumber: number;
    var url: string;
    export namespace ScholarShip {
        export class Parser {
            model = {
                stateList: [] as any[],
                stateScholarships: [] as any[]
            };
            constructor(public url: string, public pageNumber: number) { }
            getStatesList(callback: IStateList): void {
                var stateUrls: any[] = [];
                var msg = "";
                request(url, (error: any, response: any, html: any) => {
                    if (!error && response.statusCode == 200) {
                        var $ = cheerio.load(html);
                        $('ul[class*="list left"]>li').each((i, element) => {
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
                    };
                });
            }
            getStateScholarships(callback: IStateScholarships): void {
                var subStateUrls: any[] = [];
                var ctr = 0;
                var removed = this.model.stateList.splice(1, 1);
                _.each(removed, (item, index) => {
                    var url = item.Link;
                    var state = item.State.split(" ")[0];
                    request(url, (error: any, response: any, html: any) => {
                        if (!error && response.statusCode == 200) {
                            const $ = cheerio.load(html);
                            const urls = $('tr[class="odd"]>td').find("a");
                            if (urls.length > 0) {
                                _.each(urls, (stateChildSubUrl, index) => {
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
                            const msg = `Error: ${url}[${error}]: `;
                            console.log(msg);
                        }
                    }, state);

                });

            }

            reIndexData(jsonArray: any[]): any[] {
                _.each(jsonArray, (item, index) => {
                     item.id = index;
                });
                return jsonArray;
            }
        }
    }

    pageNumber = <number>(process.argv[2] || 0);
    url = 'https://www.schoolsoup.com/scholarship-directory/state/';
    var app = new App.ScholarShip.Parser(url, pageNumber);
    app.getStatesList((result: any[]): void => {
        if (result.length > 0)
            app.model.stateList = result;

        app.getStateScholarships((statescholarship: any[]): void => {
            var filePath = "./data.json";
            var strJson = "";
            var objScholarship: any[];
            if (IO.File.exist((filePath))) {
                if (IO.File.size(filePath) > 0) {
                    objScholarship = JSON.parse(fs.readFileSync(filePath, "utf8"));                   
                    objScholarship = objScholarship.concat(statescholarship);                   
                } else {
                    objScholarship = statescholarship;
                }
                objScholarship = app.reIndexData(objScholarship);                                          
                strJson = JSON.stringify(objScholarship, null, 2);
            } else {
                objScholarship = app.reIndexData(statescholarship);
                strJson = JSON.stringify(objScholarship, null, 2);
            }

            IO.File.clearContent(filePath);   
            IO.File.append(filePath,strJson);
        });
    });

}



