"use strict";
var System_IO_File = require("./system/io/file");
var System_IO_Directory = require("./system/io/directory");
var ScholarShip = require("./scholarship/main");
var file = new System_IO_File.File();
var directory = new System_IO_Directory.Directory();
var app = new ScholarShip.Main.Parser();
directory.createDirectory(app.options.outputDirectory);
app.options.url = 'https://www.schoolsoup.com/scholarship-directory/state/';
app.options.stateId = (process.argv[2] || 1);
app.options.pageNumber = (process.argv[3] || 0);
console.log("Staring State Index: " + app.options.pageNumber + " Page Number:" + app.options.pageNumber);
app.main(function (result) {
    if (result.length > 0)
        app.options.stateList = result;
    app.getPl(function (statescholarship) {
        var filePath = app.options.fileName;
        var strJson = "";
        var objScholarship;
        if (file.exist((filePath))) {
            if (file.size(filePath) > 0) {
                objScholarship = file.getJsonArray(filePath);
                objScholarship = objScholarship.concat(statescholarship);
            }
            else {
                objScholarship = statescholarship;
            }
            objScholarship = app.reIndexData(objScholarship);
            strJson = JSON.stringify(objScholarship, null, 2);
        }
        else {
            objScholarship = app.reIndexData(statescholarship);
            strJson = JSON.stringify(objScholarship, null, 2);
        }
        file.clearContent(filePath);
        file.append(filePath, strJson);
    });
});
//# sourceMappingURL=app.js.map