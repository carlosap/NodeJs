//namespace AdobeDtm {
//    export interface IAdobeDtm {
//        clientId: string;
//        eventName: string;
//        productIds: any[];
//        contentType: string;
//        value: number;
//        currency:string;
//        src: string;
//        scriptArray: any[];
//    }
//    export namespace Analytics {
//        export class Track implements IAdobeDtm {
//            eventName: string;
//            productIds: any[];
//            contentType: string;
//            value: number;
//            currency: string;
//            scriptArray: any[];
//            constructor(public clientId: string, public src:string) {
//                this.loadScripts();
//            }
//            loadScripts() {
//                if (!this.scriptArray[this.src]) {
//                    this.scriptArray[this.src] = true;                   
//                    console.log('DTM Scripts Loaded');
//                }
//            }
//        }
//    }
//}
//var clientId = '1696059900608890';
//var src = '//assets.adobedtm.com/4645b2b01b7fab10a2f4a0a6ced49b690c1c2cb6/satelliteLib-908a288b71bbcb797b4e8a632deb4838d3d32b0e.js';
//let adobeDtm = new AdobeDtm.Analytics.Track(clientId, src);
//adobeDtm.loadScripts();
//# sourceMappingURL=AdobeDtm.js.map