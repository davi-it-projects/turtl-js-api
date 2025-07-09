import { TurtlResponse } from "./TurtlResponse.js";

export class TurtlAPI {
    constructor({ host, getAuthToken = null }) {
        this.host = host;
        this.getAuthToken = getAuthToken;
        this.services = new Map();
        this.validationRules = new Map();

        // Register built-in validation rules
        this.registerValidationRule("required", (value, instance, options) => {
            if (value === undefined || value === null || value === "") {
                return TurtlResponse.Error(options.message || "Field is required.");
            }
            return TurtlResponse.Success();
        });
        this.registerValidationRule("email", (value, instance, options) => {
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return TurtlResponse.Error(options.message || "Must be a valid email.");
            }
            return TurtlResponse.Success();
        });
        this.registerValidationRule("string", (value, instance, options) => {
            if (value !== undefined && typeof value !== "string") {
                return TurtlResponse.Error(options.message || "Must be a string.");
            }
            return TurtlResponse.Success();
        });
        this.registerValidationRule("number", (value, instance, options) => {
            if (value !== undefined && typeof value !== "number") {
                return TurtlResponse.Error(options.message || "Must be a number.");
            }
            return TurtlResponse.Success();
        });
        this.registerValidationRule("minLength", (value, instance, options) => {
            if (value !== undefined && typeof value === "string") {
                if (value.length < (options.length || 0)) {
                    return TurtlResponse.Error(options.message || `Minimum length is ${options.length}.`);
                }
            }
            return TurtlResponse.Success();
        });
        // Add more built-in rules here if needed
    }

    registerValidationRule(name, fn) {
        this.validationRules.set(name, fn);
    }

    getValidationRule(name) {
        return this.validationRules.get(name);
    }

    static async sendRequest(method, url, body, requiresAuth, getAuthToken) {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.setRequestHeader("Content-Type", "application/json");

            if (requiresAuth) {
                const token = getAuthToken ? getAuthToken() : null;
                if (token) {
                    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
                } else {
                    resolve(TurtlResponse.Error("Authentication required."));
                    return;
                }
            }

            xhr.onload = () => {
                try {
                    const json = JSON.parse(xhr.responseText);
                    resolve(TurtlResponse.fromJson(json));
                } catch (e) {
                    resolve(TurtlResponse.Error("Invalid response"));
                }
            };

            xhr.onerror = () => resolve(TurtlResponse.Error("Network error"));
            xhr.send(JSON.stringify(body));
        });
    }

    async call(fullName, modelOrData) {
        const data = this.#getDataFromFullName(fullName);
        if (data.Failed) {
            return data.Response;
        }
        const service = data.Service;
        const endpoint = data.Endpoint;

        const isModel = modelOrData && modelOrData._schema && typeof modelOrData._schema === "object";
        return isModel
            ? await this.#callWithModel(modelOrData, service, endpoint)
            : await this.#callWithData(modelOrData, service, endpoint);
    }

    async #callWithData(data, service, endpoint) {
        const modelFactory = service.getModel(endpoint.modelName);
        if (modelFactory && modelFactory.create && typeof modelFactory.create === "function") {
            const requestModel = modelFactory.create(data, this); // Inject api here
            return await this.#callWithModel(requestModel, service, endpoint);
        }
        return TurtlResponse.Error("Invalid data");
    }

    async #callWithModel(requestModel, service, endpoint) {
        if (!requestModel.isValid) {
            return requestModel.validateResult;
        }
        return await this.#sendRequest(requestModel, service, endpoint);
    }

    async #sendRequest(model, service, endpoint) {
        const url = `${this.host}${service.basePath}${endpoint.path}`;
        const method = endpoint.method;

        try {
            return await TurtlAPI.sendRequest(
                method,
                url,
                model.toDataObject(),
                endpoint.requiresAuth,
                this.getAuthToken
            );
        } catch (error) {
            return TurtlResponse.Error("Request failed");
        }
    }

    addService(name, service) {
        this.services.set(name, service);
    }

    getService(name) {
        return this.services.get(name);
    }

    #getDataFromFullName(fullName) {
        const [serviceName, endpointName] = fullName.split(".");
        const output = {
            Failed: true,
            Response: null,
            Service: null,
            Endpoint: null,
        };

        const service = this.getService(serviceName);
        if (!service) {
            output.Response = TurtlResponse.Error(`Service '${serviceName}' not found.`);
            return output;
        }
        output.Service = service;

        const endpoint = service.getEndpoint(endpointName);
        if (!endpoint) {
            output.Response = TurtlResponse.Error(`Endpoint '${endpointName}' not found in service '${serviceName}'.`);
            return output;
        }
        output.Endpoint = endpoint;
        output.Failed = false;
        return output;
    }

    createRequest(fullName, data) {
        try {
            const internal = this.#getDataFromFullName(fullName);
            if (internal.Failed) {
                return internal.Response;
            }
            const modelFactory = internal.Service.getModel(internal.Endpoint.modelName);
            if (modelFactory && modelFactory.create && typeof modelFactory.create === "function") {
                return modelFactory.create(data, this); // Inject api here
            }
            throw new Error(`Failed to create request '${fullName}'.`);
        } catch (error) {
            throw error;
        }
    }
}
