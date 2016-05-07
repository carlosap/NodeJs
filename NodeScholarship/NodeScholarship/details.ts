import Io = require("./system/io/file");
import web = require("./system/web/request");
import _ = require("lodash");
var file = new Io.File();
var req = new web.Request.Get();
export namespace ProductDetails {
    export interface IParse{
        (Parse: any): any;
    }
    export class Parse {
        error: any;
        html: string;
        statusCode: number;
        url: string;
        queryString: string;
        $: CheerioStatic;
        constructor() {}
        Parse(callback: IParse): any {
            const _this = this;

        }

    }

    var productDetails = new ProductDetails.Parse();
    productDetails.url = 

}



