import System_WEB_Request = require("../system/web/request");
import _ = require("lodash");
var req = new System_WEB_Request.Request.Get();
export namespace Main {
    export interface Imain {
        (main: any[]): any;
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
            req.url = _this.options.url;
            req.Get((response: any): any => {
                response.$('ul[class*="list left"]>li').each((i, element) => {
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
        }

        reIndexData(jsonArray: any[]): any[] {
            _.each(jsonArray, (item, index) => {
                item.id = index;
            });
            return jsonArray;
        }
    }

}