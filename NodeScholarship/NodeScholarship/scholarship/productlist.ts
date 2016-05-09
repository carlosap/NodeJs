import System_IO_Directory = require("../system/io/directory");
import System_WEB_Request = require("../system/web/request");
import _ = require("lodash");
var sleep = require("sleep");
var directory = new System_IO_Directory.Directory();
var req = new System_WEB_Request.Request.Get();

export interface IStatePl {
    (getPl: any[]): any;
}
export class ProductList {
    options = {
        stateId: 0,
        url: "",
        outputDirectory: "output",
        fileName: "",
        pageNumber: 0,
        stateList: [] as any[],
        stateScholarships: [] as any[]
    };
    constructor(options: any) {
        this.options = options;
    }
    getPl(callback: IStatePl): void {
        var _this = this;
        var subStateUrls: any[] = [];
        var ctr = 0;
        const removed = _this.options.stateList.splice(_this.options.stateId, 1);
        _.each(removed, (item) => {

            var url = item.Link;
            var state = item.State.replace(" Scholarships", "");
            _this.options.outputDirectory = _this.options.outputDirectory + "/" + state;
            directory.createDirectory(_this.options.outputDirectory);
            _this.options.fileName = "./" + _this.options.outputDirectory + "/" + state + _this.options.pageNumber + ".json";
            console.log(`State Name: ${state}`);
            console.log(`File Name: ${_this.options.fileName}`);
            req.url = url;
            req.Get((response: any): any => {
                const urls = response.$('tr[class="odd"]>td').find("a");
                if (urls.length > 0) {
                    _.each(urls, (stateChildSubUrl) => {
                        ctr++;
                        var suburl = url.replace("?page=" + _this.options.pageNumber, "") + stateChildSubUrl.attribs.href.replace("./", "");
                        subStateUrls.push({ State: state, Link: suburl });
                        sleep.usleep(20000);
                        console.log(ctr + "- " + suburl);
                    });
                }
                callback(subStateUrls);
            });
        });
    }
}