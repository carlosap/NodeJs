import request = require("request");
import cheerio = require("cheerio");

export namespace Request {
    export interface IGet {
        (Get: any): any;
    }
    export class Get {
        error: any;
        html: string;
        statusCode: number;
        url: string;
        queryString: string;
        $: CheerioStatic;
        constructor(url: string = "",queryString:string = "") {
            this.url = url;
            this.queryString = queryString;
        }
        Get(callback: IGet): any {
            const _this = this;
            request(_this.url, (error: any, response: any, html: any) => {
                _this.$ = cheerio.load(html);
                _this.html = html;
                _this.statusCode = response.statusCode;
                _this.error = error;
                callback(_this);

            });
        }
    }
}

