export class TurtlEndpoint {
    constructor({ name, path, method = "POST", modelName, requiresAuth = false, mockResponseSuccess = null, mockResponseFailure = null, headers = {} }) {
        this.name = name;
        this.path = path;
        this.method = method;
        this.modelName = modelName;
        this.requiresAuth = requiresAuth;
        this.mockResponseSuccess = mockResponseSuccess;
        this.mockResponseFailure = mockResponseFailure;
        this.headers = headers;
    }
}
