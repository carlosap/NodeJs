import fs = require("fs");
var path = require("path");
export class Directory {
    constructor() { }
    createDirectory(dirPath: string,mode :number= 777) {
        fs.mkdir(dirPath, mode, error => {
            if (error && error.errno === 34) {
                this.createDirectory(path.dirname(dirPath), mode);
                this.createDirectory(dirPath, mode);
            }
        });
    };
}
