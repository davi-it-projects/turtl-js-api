import { TurtlEndpoint } from "./TurtlEndpoint.js";
import { TurtlRequestModel } from "./TurtlRequestModel.js";

export class TurtlAPIService {
    constructor(name, basePath) {
        this.name = name;
        this.basePath = basePath;
        this.endpoints = new Map();
        this.Models = new Map();
        this.headers = new Map();

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
        let endpoint = this.endpoints.get(name);
        console.log(endpoint)
        console.log(this.headers)
        for (const [key, value] of this.headers) {
            if ((key in endpoint.headers) == false) {
                endpoint.headers[key] = value
            }
        }
        return endpoint
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

    addHeader(name, value) {
        this.headers.set(name, value);
    }
    getHeaders() {
        return this.headers;
    }
}
