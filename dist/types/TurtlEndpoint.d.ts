export class TurtlEndpoint {
    constructor({ name, path, method, modelName, requiresAuth, mockResponseSuccess, mockResponseFailure, headers, }: {
        name: any;
        path: any;
        method?: string;
        modelName?: string;
        requiresAuth?: boolean;
        mockResponseSuccess?: any;
        mockResponseFailure?: any;
        headers?: {};
    });
    name: any;
    path: any;
    method: string;
    modelName: string;
    requiresAuth: boolean;
    mockResponseSuccess: any;
    mockResponseFailure: any;
    headers: {};
}
