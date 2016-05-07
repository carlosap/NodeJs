"use strict";
var fs = require("fs");
var path = require("path");
var Directory = (function () {
    function Directory() {
    }
    Directory.prototype.createDirectory = function (dirPath, mode) {
        var _this = this;
        if (mode === void 0) { mode = 777; }
        fs.mkdir(dirPath, mode, function (error) {
            if (error && error.errno === 34) {
                _this.createDirectory(path.dirname(dirPath), mode);
                _this.createDirectory(dirPath, mode);
            }
        });
    };
    ;
    return Directory;
}());
exports.Directory = Directory;
//# sourceMappingURL=directory.js.map