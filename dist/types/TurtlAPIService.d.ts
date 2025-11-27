export class TurtlAPIService {
    constructor(name: any, basePath: any);
    name: any;
    basePath: any;
    endpoints: any;
    Models: any;
    headers: any;
    addEndpoint(name: any, config: any): void;
    getEndpoint(name: any): any;
    addModel(name: any, model: any): void;
    getModel(name: any): any;
    addHeader(name: any, value: any): void;
    getHeaders(): any;
}
