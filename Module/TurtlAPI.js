import { TurtlResponse } from "./TurtlResponse.js";

export class TurtlAPI {
    constructor({ host, getAuthToken = null, mock = false }) {
        this.host = host;
        this.getAuthToken = getAuthToken;
        this.services = new Map();
        this.validationRules = new Map();
        this.mock = mock;

        // Register built-in validation rules
        this.registerValidationRule("required", (value, instance, options) => {
            if (value === undefined || value === null || value === "") {
                return TurtlResponse.Error("Field is required.");
            }
            return TurtlResponse.Success();
        });
        this.registerValidationRule("email", (value, instance, options) => {
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return TurtlResponse.Error("Must be a valid email.");
            }
            return TurtlResponse.Success();
        });

        this.registerValidationRule("minLength", (value, instance, options) => {
            if (value !== undefined && typeof value === "string") {
                if (value.length < (options.length || 0)) {
                    return TurtlResponse.Error(`Minimum length is ${options.length}.`);
                }
            }
            return TurtlResponse.Success();
        });
        this.registerValidationRule("arrayOf", (value, _instance, options) => {
            const { type, isTypeClass = false } = options || {};
            if (!Array.isArray(value)) {
                return TurtlResponse.Error("Value must be an array.");
            }
            if (!type) {
                return TurtlResponse.Error("No type specified for arrayOf rule.");
            }
            for (const item of value) {
                if (isTypeClass) {
                    // Check if item is an instance of the specified class
                    if (!(item instanceof type)) {
                        return TurtlResponse.Error(`Array item must be an instance of '${type.name}', but got '${typeof item}'.`);
                    }
                } else {
                    // Check if item is of the specified type
                    if (typeof item !== type) {
                        return TurtlResponse.Error(`Array item must be of type '${type}', but got '${typeof item}'.`);
                    }
                }
            }
            return TurtlResponse.Success();
        });
        this.registerValidationRule("instanceOf", (value, _instance, options) => {
            const { type } = options || {};
            if (!type) {
                return TurtlResponse.Error("No type specified for InstanceOf rule.");
            }
            if (!(value instanceof type)) {
                return TurtlResponse.Error(`Value must be an instance of '${type.name}', but got '${typeof value}'.`);
            }
            return TurtlResponse.Success();
        });
        this.registerValidationRule("typeOf", (value, _instance, options) => {
            const { type } = options || {};
            if (!type) {
                return TurtlResponse.Error("No type specified for TypeOf rule.");
            }
            if (typeof value !== type) {
                return TurtlResponse.Error(`Value must be of type '${type}', but got '${typeof value}'.`);
            }
            return TurtlResponse.Success();
        });
    }

    registerValidationRule(name, fn) {
        if (name in this.validationRules) {
            console.warn(`[TurtlAPI] Validation rule '${name}' is already registered. Overwriting.`);
        }

        this.validationRules.set(name, fn);
    }

    getValidationRule(name) {
        return this.validationRules.get(name);
    }

    listValidationRules() {
        return Array.from(this.validationRules.keys());
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

    async call(fullName, modelOrData, mockResult = true) {
        const data = this.#getDataFromFullName(fullName);
        if (data.Failed) {
            return data.Response;
        }
        const service = data.Service;
        const endpoint = data.Endpoint;

        const isModel = modelOrData && modelOrData._schema && typeof modelOrData._schema === "object";
        return isModel
            ? await this.#callWithModel(modelOrData, service, endpoint, mockResult)
            : await this.#callWithData(modelOrData, service, endpoint, mockResult);
    }

    async #callWithData(data, service, endpoint, mockResult = true) {
        const modelFactory = service.getModel(endpoint.modelName);
        if (modelFactory && modelFactory.create && typeof modelFactory.create === "function") {
            const requestModel = modelFactory.create(data, this); // Inject api here
            return await this.#callWithModel(requestModel, service, endpoint, mockResult);
        }
        return TurtlResponse.Error("Invalid data");
    }

    async #callWithModel(requestModel, service, endpoint, mockResult = true) {
        if (!requestModel.isValid) {
            return requestModel.validateResult;
        }
        return await this.#sendRequest(requestModel, service, endpoint, mockResult);
    }

    async #sendRequest(model, service, endpoint, mockResult = true) {
        if (this.mock) {
            if (mockResult) {
                // If endpoint has a mockResponse, use it
                if (typeof endpoint.mockResponseSuccess === "function") {
                    return await endpoint.mockResponseSuccess(model, service, endpoint, this);
                }
                if (endpoint.mockResponseSuccess !== undefined) {
                    return typeof endpoint.mockResponseSuccess.then === "function"
                        ? await endpoint.mockResponseSuccess
                        : endpoint.mockResponseSuccess;
                }
                // Default mock response
                return TurtlResponse.Success("Mocked response", {});
            }
            else {
                // If endpoint has a mockResponseFailure, use it
                if (typeof endpoint.mockResponseFailure === "function") {
                    return await endpoint.mockResponseFailure(model, service, endpoint, this);
                }
                if (endpoint.mockResponseFailure !== undefined) {
                    return typeof endpoint.mockResponseFailure.then === "function"
                        ? await endpoint.mockResponseFailure
                        : endpoint.mockResponseFailure;
                }
                // Default mock failure response
                return TurtlResponse.Error("Mocked failure response");
            }
        }

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

    addService(nameOrService, maybeService) {
        if (maybeService !== undefined) {
            // Deprecated usage: (name, service)
            console.warn("[TurtlAPI] addService(name, service) is deprecated. Use addService(service) instead.");
            this.services.set(nameOrService, maybeService);
        } else {
            // New usage: (service)
            const service = nameOrService;
            if (!service || !service.name) {
                throw new Error("Service must have a 'name' property.");
            }
            this.services.set(service.name, service);
        }
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
