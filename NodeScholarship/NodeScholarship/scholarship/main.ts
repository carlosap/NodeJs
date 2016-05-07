import System_WEB_Request = require("../system/web/request");
import _ = require("lodash");
var sleep = require("sleep");
var req = new System_WEB_Request.Request.Get();
export namespace Main {
    export interface Imain {
        (main: any[]): any;
    }

    export interface IStatePl {
        (getPl: any[]): any;
    }

    export interface IPd {
        (getPd: any[]): any;
    }

    export class Parser {
        options = {
            stateId: 0,
            url: "",
            outputDirectory: "output",
            fileName: "",
            pageNumber: 0,
            stateList: [] as any[],
            stateScholarships: [] as any[]
        };
        constructor() { }
        main(callback: Imain): void {
            var _this = this;
            var stateUrls: any[] = [];
            var msg = "";
            req.url = _this.options.url;
            req.Get((response: any): any => {
                response.$('ul[class*="list left"]>li').each((i, element) => {
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
        }
        getPl(callback: IStatePl): void {
            var _this = this;
            var subStateUrls: any[] = [];
            var ctr = 0;
            const removed = _this.options.stateList.splice(_this.options.stateId, 1);
            _.each(removed, (item) => {

                var url = item.Link;
                var state = item.State.replace(" Scholarships", "");
                _this.options.fileName = "./" + _this.options.outputDirectory + "/" + state + _this.options.stateId + ".json";
                console.log(`State Name: ${state}`);
                console.log(`File Name: ${_this.options.fileName}`);
                req.url = url;
                req.Get((response: any): any => {
                    const urls = response.$('tr[class="odd"]>td').find("a");
                    if (urls.length > 0) {
                        _.each(urls, (stateChildSubUrl) => {
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
        }
        getPd(callback: IPd): void {

        }
        reIndexData(jsonArray: any[]): any[] {
            _.each(jsonArray, (item, index) => {
                item.id = index;
            });
            return jsonArray;
        }
    }

}