"use strict";
var fs = require("fs");
var IO;
(function (IO) {
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
})(IO = exports.IO || (exports.IO = {}));
//# sourceMappingURL=io.js.map