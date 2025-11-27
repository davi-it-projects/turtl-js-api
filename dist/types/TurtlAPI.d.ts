export class TurtlAPI {
    static sendRequest(method: any, url: any, body: any, requiresAuth: any, getAuthToken: any, headers?: {}): Promise<any>;
    constructor({ host, getAuthToken, mock }: {
        host: any;
        getAuthToken?: any;
        mock?: boolean;
    });
    host: any;
    getAuthToken: any;
    services: any;
    validationRules: any;
    mock: boolean;
    headers: any;
    registerValidationRule(name: any, fn: any): void;
    getValidationRule(name: any): any;
    listValidationRules(): any;
    call(fullName: any, modelOrData?: {}, mockResult?: boolean): Promise<any>;
    addService(nameOrService: any, maybeService: any): void;
    getService(name: any): any;
    createRequest(fullName: any, data: any): any;
    addHeader(name: any, value: any): void;
    getHeaders(): any;
    #private;
}
