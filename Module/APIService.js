import { TTEndpoint } from "./TTEndpoint.js";

export class APIService {
    constructor(name, basePath) {
        this.name = name;
        this.basePath = basePath;
        this.endpoints = new Map();
        this.Models = new Map();
    }

    addEndpoint(name, config) {
        const endpoint = new TTEndpoint({ ...config, name });
        if (this.Models.has(endpoint.modelName) === false) {
            console.log(this.Models);
            console.log(endpoint);
            throw new Error(`Request model ${endpoint.modelName} does not exist`);
        }
        this.endpoints.set(name, endpoint);
    }

    getEndpoint(name) {
        return this.endpoints.get(name);
    }

    addModel(name,model) {
        if (this.Models.has(name)) {
        throw new Error(`Request model '${name}' already exists`);
        }
        this.Models.set(name, model);
    }

    getModel(name) {
        return this.Models.get(name);
    }
}
