import System_WEB_Request = require("../system/web/request");
import System_IO_File = require("../system/io/file");
var req = new System_WEB_Request.Request.Get();
var file = new System_IO_File.File();
export interface IPd {
    (): void;
}
export class ProducDetails {
    model = {
        id:"",
        name: "",
        amount: "",
        type: "",
        description: "",
        website: "",
        url: "",
        outputDirectory: "output",
        filePath: ""
    };
    constructor() {}
    getPd(callback: IPd): void {
        var _this = this;
        req.url = _this.model.url;
        if (req.url) {
            req.Get((response: any): any => {
                //standar parser
                var name = response.$('h1').text().replace('Scholarship', '').trim();
                var amount = response.$('tr').eq(1).find('td').eq(1).text().split(' ')[0].trim();
                var type = response.$('tr').eq(0).find('td').eq(1).text().trim();
                var website = response.$('tr').eq(3).find('td').eq(1).text();
                var description = response.$('tr').eq(5).find('td').eq(0).text().trim();
                //if the amount is scholarship then move the tr index by 1
                if (amount === "Scholarship") {
                    type = response.$('tr').eq(1).find('td').eq(1).text().trim();
                    amount = response.$('tr').eq(2).find('td').eq(1).text().split(' ')[0].trim();
                    website = response.$('tr').eq(4).find('td').eq(1).text();
                    description = response.$('tr').eq(6).find('td').eq(0).text().trim();
                }
                if (website === '') {
                    website = response.$('tr').eq(3).find('td').eq(1).text();
                    if (website === '') {
                        website = response.$('tr').eq(2).find('td').eq(1).text();
                    }
                }
                var tempArray = _this.model.url.split('-');
                _this.model.id = tempArray[tempArray.length - 1].replace('/', '').trim() || '';
                _this.model.filePath = _this.model.outputDirectory + "/" + _this.model.id + ".json";
                _this.model.name = name;
                _this.model.type = type;
                _this.model.amount = amount;
                _this.model.website = website;
                _this.model.description = description;
                callback();
            });
        } else {
            callback();
        }
    }
}

var productDetail = new ProducDetails();
productDetail.model.url = (process.argv[2] || '');
productDetail.getPd((): void => {

    if (productDetail.model.id) {
        const strJson = JSON.stringify(productDetail.model, null, 2);
        file.clearContent(productDetail.model.filePath);
        file.append(productDetail.model.filePath, strJson);
        console.log(productDetail.model.name);
    }
    console.log("end");
});

