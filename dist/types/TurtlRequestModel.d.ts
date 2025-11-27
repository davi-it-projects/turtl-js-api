export class TurtlRequestModel {
    static validateFields(schema: any, instance: any, api: any): TurtlResponse;
    static createFactory(schema: any, customValidator?: any): {
        create(data?: {}, api?: any): TurtlRequestModel;
    };
    constructor(data?: {}, schema?: {}, customValidator?: any, api?: any);
    _schema: {};
    _customValidator: any;
    _api: any;
    validateResult: any;
    isValid: boolean;
    getErrorMessage(index: any, defaultMessage: any, options: any): any;
    toDataObject(): {};
}
import { TurtlResponse } from "./TurtlResponse.js";
