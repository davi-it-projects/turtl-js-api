class TurtlResponse {
    constructor(success = false, message = "", data = {}) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    static fromJson(json) {
        return new TurtlResponse(
            json.success ?? false,
            json.message ?? "",
            json.data ?? {},
        );
    }

    static Error(message) {
        return new TurtlResponse(false, message);
    }

    static Success(message = "", data = {}) {
        return new TurtlResponse(true, message, data);
    }
}

class TurtlAPI {
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
                    return await endpoint.mockResponseSuccess(model);
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
                    return await endpoint.mockResponseFailure(model);
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

class TurtlEndpoint {
    constructor({ name, path, method = "POST", modelName, requiresAuth = false, mockResponseSuccess = null, mockResponseFailure = null }) {
        this.name = name;
        this.path = path;
        this.method = method;
        this.modelName = modelName;
        this.requiresAuth = requiresAuth;
        this.mockResponseSuccess = mockResponseSuccess;
        this.mockResponseFailure = mockResponseFailure;
    }
}

class TurtlRequestModel {
    constructor(data = {}, schema = {}, customValidator = null, api = null) {
        this._schema = schema;
        this._customValidator = customValidator;
        this._api = api;

        Object.assign(this, data);

        const result = TurtlRequestModel.validateFields(schema, this, api);
        const custom = customValidator ? customValidator(this) : null;

        if (!result.success) {
            this.validateResult = result;
            this.isValid = false;
        } else if (custom && !custom.success) {
            this.validateResult = custom;
            this.isValid = false;
        } else {
            this.validateResult = TurtlResponse.Success("Validation successful");
            this.isValid = true;
        }
    }

    static validateFields(schema, instance, api) {
        for (const key in schema) {
            const rulesArray = schema[key];
            const value = instance[key];

            if (!Array.isArray(rulesArray)) {
                return TurtlResponse.Error(`Schema for field '${key}' must be an array.`);
            }

            for (const ruleEntry of rulesArray) {
                const ruleName = ruleEntry.rule;
                const options = ruleEntry.options || {};

                const validator = api?.getValidationRule(ruleName);
                if (typeof validator !== "function") {
                    return TurtlResponse.Error(`Validation rule '${ruleName}' not registered.`);
                }

                const result = validator(value, instance, options);
                if (result instanceof TurtlResponse && !result.success) {
                    return result;
                }
            }
        }

        return TurtlResponse.Success();
    }

    toDataObject() {
        const cleaned = {};
        for (const key in this) {
            if (!["_schema", "_customValidator", "_api", "validateResult", "isValid"].includes(key)) {
                cleaned[key] = this[key];
            }
        }
        return cleaned;
    }

    static createFactory(schema, customValidator = null) {
        return {
            create(data = {}, api = null) {
                return new TurtlRequestModel(data, schema, customValidator, api);
            }
        };
    }
}

class TurtlAPIService {
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

export { TurtlAPI, TurtlAPIService, TurtlEndpoint, TurtlRequestModel, TurtlResponse };
//# sourceMappingURL=turtl-js-api.mjs.map
