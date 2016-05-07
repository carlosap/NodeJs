import fs = require("fs");
    var fileSizeInMegabytes: number;
    export class File {
        constructor() { }
        append(filePath: string, msg: string) {
            fs.appendFile(filePath, msg, (err: any) => {
                if (err) {
                    this.append(filePath, msg);
                    return console.log(err);
                }
            });
        };
        read(filePath: string) {
            try {
                return fs.readFileSync(filePath, "utf8");
            } catch (e) {
                return "";
            }
        };
        exist(filePath: string) {
            try {
                const stats: any = fs.lstatSync(filePath);
                return stats.isFile ? true : false;
            } catch (e) {
                return false;
            }
        }
        clearContent(filePath: string) {
            try {
                if (this.exist(filePath)) {
                    fs.writeFile(filePath, "");
                }
                return (this.size(filePath) > 0);
            } catch (e) {
                return false;
            }
        }
        size(filePath: string) {
            try {
                const stats = fs.statSync(filePath);
                const fileSizeInBytes = stats["size"];
                return fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
            } catch (e) {
                return 0;
            }
        }

        getJsonArray(filePath: string) {
            let objJsonArray: any[];
            try {
                objJsonArray = JSON.parse(fs.readFileSync(filePath, "utf8"));
                return objJsonArray;
            } catch (e) {
                //todo have log events.
                return null;
            }
        }
    }
