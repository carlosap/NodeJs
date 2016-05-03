var fs = require('fs');
var FileWrite = function (filePath, msg){
        fs.appendFile(filePath, msg, function (err) {
        if (err){
            FileWrite(filePath,msg);
            return console.log(err);
        }
    });
}
module.exports = FileWrite;