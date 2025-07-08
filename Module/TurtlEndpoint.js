export class TurtlEndpoint {
    constructor({ name, path, method = "POST", modelName: modelName, requiresAuth = false }) {
        this.name = name;
        this.path = path;
        this.method = method;
        this.modelName = modelName;
        this.requiresAuth = requiresAuth;
    }
}
