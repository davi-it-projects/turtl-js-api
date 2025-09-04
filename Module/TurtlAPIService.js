import { TurtlEndpoint } from "./TurtlEndpoint.js";

export class TurtlAPIService {
    constructor(name, basePath) {
        this.name = name;
        this.basePath = basePath;
        this.endpoints = new Map();
        this.Models = new Map();

        // Add default models
        this.addModel('empty', TurtlRequestModel.createFactory({}));
    }

    addEndpoint(name, config) {
        const endpoint = new TurtlEndpoint({ ...config, name });
        if (!this.Models.has(endpoint.modelName)) {
            throw new Error(`Request model '${endpoint.modelName}' does not exist`);
        }
        this.endpoints.set(name, endpoint);
    }

    getEndpoint(name) {
        return this.endpoints.get(name);
    }

    addModel(name, model) {
        if (this.Models.has(name)) {
            throw new Error(`Request model '${name}' already exists`);
        }
        this.Models.set(name, model);
    }

    getModel(name) {
        return this.Models.get(name);
    }
}
