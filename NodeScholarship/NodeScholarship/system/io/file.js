"use strict";
var fs = require("fs");
var fileSizeInMegabytes;
var File = (function () {
    function File() {
    }
    File.prototype.append = function (filePath, msg) {
        var _this = this;
        fs.appendFile(filePath, msg, function (err) {
            if (err) {
                _this.append(filePath, msg);
                return console.log(err);
            }
        });
    };
    ;
    File.prototype.read = function (filePath) {
        try {
            return fs.readFileSync(filePath, "utf8");
        }
        catch (e) {
            return "";
        }
    };
    ;
    File.prototype.exist = function (filePath) {
        try {
            var stats = fs.lstatSync(filePath);
            return stats.isFile ? true : false;
        }
        catch (e) {
            return false;
        }
    };
    File.prototype.clearContent = function (filePath) {
        try {
            if (this.exist(filePath)) {
                fs.writeFile(filePath, "");
            }
            return (this.size(filePath) > 0);
        }
        catch (e) {
            return false;
        }
    };
    File.prototype.size = function (filePath) {
        try {
            var stats = fs.statSync(filePath);
            var fileSizeInBytes = stats["size"];
            return fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
        }
        catch (e) {
            return 0;
        }
    };
    File.prototype.getJsonArray = function (filePath) {
        var objJsonArray;
        try {
            objJsonArray = JSON.parse(fs.readFileSync(filePath, "utf8"));
            return objJsonArray;
        }
        catch (e) {
            //todo have log events.
            return null;
        }
    };
    return File;
}());
exports.File = File;
//# sourceMappingURL=file.js.map