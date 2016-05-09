import System_IO_File = require("./system/io/file");
import ScholarShip = require("./scholarship/main");
import ScholarShipList = require("./scholarship/productlist");
import _ = require("lodash");
var file = new System_IO_File.File();
var app = new ScholarShip.Main.Parser();


app.options.url = 'https://www.schoolsoup.com/scholarship-directory/state/';
app.options.stateId = <number>(process.argv[2] || 4);
app.options.pageNumber = <number>(process.argv[3] || 1);
console.log(`Staring State Index: ${app.options.pageNumber} Page Number:${app.options.pageNumber}`);
app.main((result: any[]): void => {
    if (result.length > 0)
        app.options.stateList = result;

    var productlist = new ScholarShipList.ProductList(app.options);
    productlist.getPl((statescholarship: any[]): void => {
        var filePath = app.options.fileName;
        var strJson = "";
        var objScholarship: any[];
        if (file.exist((filePath))) {
            if (file.size(filePath) > 0) {
                objScholarship = file.getJsonArray(filePath);
                objScholarship = objScholarship.concat(statescholarship);
            } else {
                objScholarship = statescholarship;
            }
            objScholarship = app.reIndexData(objScholarship);
            strJson = JSON.stringify(objScholarship, null, 2);
        } else {
            objScholarship = app.reIndexData(statescholarship);
            strJson = JSON.stringify(objScholarship, null, 2);
        }
        if (strJson !== "[]") {
            file.clearContent(filePath);
            file.append(filePath, strJson);
        } else {
            console.log("No Records Found");
        }
        console.log("end");
    });
});
