"use strict";
var System_WEB_Request = require("../system/web/request");
var System_IO_File = require("../system/io/file");
var req = new System_WEB_Request.Request.Get();
var file = new System_IO_File.File();
var ProducDetails = (function () {
    function ProducDetails() {
        this.model = {
            id: "",
            name: "",
            amount: "",
            type: "",
            state: "",
            description: "",
            website: "",
            url: "",
            outputDirectory: "output",
            filePath: ""
        };
    }
    ProducDetails.prototype.getPd = function (callback) {
        var _this = this;
        var urlArray = _this.model.url.split('/');
        var tempArray = _this.model.url.split('-');
        _this.model.state = urlArray[urlArray.length - 3];
        _this.model.id = tempArray[tempArray.length - 1].replace('/', '').trim() || '';
        _this.model.filePath = _this.model.outputDirectory + "/" + _this.model.state + _this.model.id + ".json";
        if (!file.exist(_this.model.filePath)) {
            req.url = _this.model.url;
            if (req.url) {
                req.Get(function (response) {
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
                    _this.model.name = name;
                    _this.model.type = type;
                    _this.model.amount = amount;
                    _this.model.website = website;
                    _this.model.description = description;
                    callback();
                });
            }
            else {
                callback();
            }
        }
        else {
            callback();
        }
    };
    return ProducDetails;
}());
exports.ProducDetails = ProducDetails;
var productDetail = new ProducDetails();
productDetail.model.url = (process.argv[2] || 'https://www.schoolsoup.com/scholarship-directory/state/alabama/A-Earl-Potts-Scholarship-19214/');
productDetail.getPd(function () {
    if (productDetail.model.id) {
        if (!file.exist(productDetail.model.filePath)) {
            var strJson = JSON.stringify(productDetail.model, null, 2);
            file.clearContent(productDetail.model.filePath);
            file.append(productDetail.model.filePath, strJson);
            console.log(productDetail.model.state +
                ": " +
                productDetail.model.name +
                " " +
                productDetail.model.amount +
                " " +
                productDetail.model.id);
        }
        else {
            console.log("Found: " + productDetail.model.filePath);
        }
    }
});
//# sourceMappingURL=details.js.map