/**
 * Represents an API endpoint configuration for Turtl.
 *
 * @class
 * @param {Object} options - The endpoint configuration options.
 * @param {string} options.name - The name of the endpoint.
 * @param {string} options.path - The API path for the endpoint.
 * @param {string} [options.method="POST"] - The HTTP method for the endpoint. Defaults to "POST".
 * @param {string} [options.modelName="empty"] - The model name associated with the endpoint. Defaults to "empty".
 * @param {boolean} [options.requiresAuth=false] - Whether the endpoint requires authentication. Defaults to false.
 * @param {*} [options.mockResponseSuccess=null] - Mock response data for successful requests.
 * @param {*} [options.mockResponseFailure=null] - Mock response data for failed requests.
 * @param {Object} [options.headers={}] - Custom headers for the endpoint requests.
 */
class TurtlEndpoint {
  /**
   * Creates a new TurtleEndpoint instance.
   * @param {Object} options - The endpoint configuration options.
   * @param {string} options.name - The name of the endpoint.
   * @param {string} options.path - The API path for the endpoint.
   * @param {string} [options.method="POST"] - The HTTP method for the endpoint -- default is POST.
   * @param {string} [options.modelName="empty"] - The model name associated with the endpoint -- default is 'empty' model.
   * @param {boolean} [options.requiresAuth=false] - Whether the endpoint requires authentication -- default is false.
   * @param {*} [options.mockResponseSuccess=null] - Mock response data for successful requests.
   * @param {*} [options.mockResponseFailure=null] - Mock response data for failed requests.
   * @param {Object} [options.headers={}] - Custom headers for the endpoint requests.
   */
  constructor({
    name,
    path,
    method = "POST",
    modelName = "empty",
    requiresAuth = false,
    mockResponseSuccess = null,
    mockResponseFailure = null,
    headers = {},
  }) {
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

/**
 * Represents a standardized response structure for API operations.
 *
 * @class
 * @property {boolean} success - Indicates if the operation was successful.
 * @property {string} message - A message describing the result of the operation.
 * @property {Object} data - Additional data returned by the operation.
 *
 * @example
 * const response = new TurtlResponse(true, "Operation succeeded", { id: 1 });
 */
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
      json.data ?? {}
    );
  }

  static Error(message) {
    return new TurtlResponse(false, message);
  }

  static Success(message = "", data = {}) {
    return new TurtlResponse(true, message, data);
  }
}

/**
 * Represents a request model with schema-based and custom validation.
 *
 * @class
 * @param {Object} [data={}] - Initial data for the model instance.
 * @param {Object} [schema={}] - Validation schema defining rules for each field.
 * @param {Function|null} [customValidator=null] - Optional custom validation function.
 * @param {Object|null} [api=null] - Optional API object providing validation rule functions.
 *
 * @property {Object} _schema - The validation schema for the model.
 * @property {Function|null} _customValidator - Custom validation function.
 * @property {Object|null} _api - API object for validation rules.
 * @property {Object} validateResult - Result of the validation process.
 * @property {boolean} isValid - Indicates if the model is valid.
 *
 * @method static createFactory
 *   Creates a factory for generating TurtlRequestModel instances with a given schema and optional custom validator.
 *   @param {Object} schema - Schema definition for the request model.
 *   @param {Function|null} [customValidator=null] - Optional custom validation function.
 *   @returns {{create: function(Object=, Object=): TurtlRequestModel}} Factory object with a `create` method.
 */
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
    if (!instance.getErrorMessage) {
      instance.getErrorMessage = (i, d, o) => {
        const errorMessages = o?.errors || [];
        return (
          (Array.isArray(errorMessages) &&
            errorMessages.length > i &&
            errorMessages[i]) ||
          d
        );
      };
    }
    for (const key in schema) {
      const rulesArray = schema[key];
      const value = instance[key];

      if (!Array.isArray(rulesArray)) {
        return TurtlResponse.Error(
          `Schema for field '${key}' must be an array.`
        );
      }

      for (const ruleEntry of rulesArray) {
        const ruleName = ruleEntry.rule;
        const options = ruleEntry.options || {};

        const validator = api?.getValidationRule(ruleName);
        if (typeof validator !== "function") {
          return TurtlResponse.Error(
            `Validation rule '${ruleName}' not registered.`
          );
        }

        const result = validator(value, instance, options);
        if (result instanceof TurtlResponse && !result.success) {
          return result;
        }
      }
    }

    return TurtlResponse.Success();
  }

  getErrorMessage(index, defaultMessage, options) {
    const errorMessages = options?.errors || [];
    return (
      (Array.isArray(errorMessages) &&
        errorMessages.length > index &&
        errorMessages[index]) ||
      defaultMessage
    );
  }

  toDataObject() {
    const cleaned = {};
    for (const key in this) {
      if (
        ![
          "_schema",
          "_customValidator",
          "_api",
          "validateResult",
          "isValid",
          "getErrorMessage",
        ].includes(key)
      ) {
        cleaned[key] = this[key];
      }
    }
    return cleaned;
  }

  /**
   * Creates a factory object for generating instances of TurtlRequestModel.
   *
   * @param {Object} schema - The schema definition for the request model.
   * @param {Function|null} [customValidator=null] - Optional custom validation function.
   * @returns {{create: function(Object=, Object=): TurtlRequestModel}} Factory object with a `create` method.
   */
  static createFactory(schema, customValidator = null) {
    return {
      create(data = {}, api = null) {
        return new TurtlRequestModel(data, schema, customValidator, api);
      },
    };
  }
}

/**
 * TurtlAPIService manages API endpoints, request models, and headers for a service.
 *
 * @class
 * @example
 * const service = new TurtlAPIService('MyService', '/api');
 * service.addModel('user', UserRequestModel.createFactory({}));
 * service.addHeader('Authorization', 'Bearer token');
 * service.addEndpoint('getUser', { path: '/user', method: 'GET', modelName: 'user' });
 *
 * @param {string} name - The name of the service.
 * @param {string} basePath - The base path for the service.
 *
 * @property {string} name - The name of the service.
 * @property {string} basePath - The base path for the service.
 * @property {Map<string, TurtlEndpoint>} endpoints - Map of endpoint names to endpoint instances.
 * @property {Map<string, TurtlRequestModel>} Models - Map of model names to request model factories.
 * @property {Map<string, string>} headers - Map of header names to header values.
 *
 * @method addEndpoint(name: string, config: object): void
 *   Adds an endpoint to the service.
 * @method getEndpoint(name: string): TurtlEndpoint
 *   Gets an endpoint by name, applying service headers.
 * @method addModel(name: string, model: TurtlRequestModel | Object): void
 *   Adds a request model to the service.
 * @method getModel(name: string): TurtlRequestModel
 *   Gets a request model by name.
 * @method addHeader(name: string, value: string): void
 *   Adds a header to the service.
 * @method getHeaders(): Map<string, string>
 *   Gets the map of headers for the service.
 */
class TurtlAPIService {
  /**
   * Creates an instance of TurtlAPIService.
   *
   * @constructor
   * @param {string} name - service name
   * @param {string} basePath - base path for the service
   */
  constructor(name, basePath) {
    this.name = name;
    this.basePath = basePath;
    this.endpoints = new Map();
    this.Models = new Map();
    this.headers = new Map();

    // Add default models
    this.addModel("empty", TurtlRequestModel.createFactory({}));
  }

  /**
   * Add an endpoint to the service
   *
   * @param {string} name - endpoint name
   * @param {object} config - endpoint configuration
   */
  addEndpoint(name, config) {
    const endpoint = new TurtlEndpoint({ ...config, name });
    if (!this.Models.has(endpoint.modelName)) {
      throw new Error(`Request model '${endpoint.modelName}' does not exist`);
    }
    this.endpoints.set(name, endpoint);
  }

  /**
   * Gets a endpoint by name
   *
   * @param {string} name - endpoint name
   * @returns {object} - endpoint configuration with Service headers applied
   */
  getEndpoint(name) {
    let endpoint = this.endpoints.get(name);
    for (const [key, value] of this.headers) {
      if (key in endpoint.headers == false) {
        endpoint.headers[key] = value;
      }
    }
    return endpoint;
  }

  /**
   * Add a model to the Service
   *
   * @param {string} name - model name
   * @param {TurtlRequestModel | Object} model - model class
   */
  addModel(name, model) {
    if (this.Models.has(name)) {
      throw new Error(`Request model '${name}' already exists`);
    }
    this.Models.set(name, model);
  }

  /**
   * Get a model by a name
   *
   * @param {string} name - model name
   * @returns {TurtlRequestModel} - model class
   */
  getModel(name) {
    return this.Models.get(name);
  }

  /**
   * Add header to the Service
   *
   * @param {string} name - header name
   * @param {string} value - header value
   */
  addHeader(name, value) {
    this.headers.set(name, value);
  }

  /**
   * Get the Map of headers on this service
   *
   * @returns {Map<string,string>} - headers map
   */
  getHeaders() {
    return this.headers;
  }
}

/**
 * TurtlAPI is a modular API client for managing services, endpoints, and request models with built-in validation.
 *
 * @class
 * @example
 * const api = new TurtlAPI({
 *   host: "https://api.example.com",
 *   getAuthToken: () => localStorage.getItem("token"),
 *   mock: false
 * });
 *
 * @param {Object} config - Configuration object.
 * @param {string} config.host - The base URL for API requests.
 * @param {Function} [config.getAuthToken=null] - Optional function to retrieve authentication token.
 * @param {boolean} [config.mock=false] - Whether to enable mock mode for responses.
 *
 * @property {string} host - The API host URL.
 * @property {Function|null} getAuthToken - Function to retrieve authentication token.
 * @property {Map<string, TurtlAPIService>} services - Registry of API services.
 * @property {Map<string, Function>} validationRules - Registry of validation rules.
 * @property {boolean} mock - Indicates if mock mode is enabled.
 * @property {Map<string, string>} headers - Registry of global headers.
 *
 * @description
 * - Manages API services and endpoints.
 * - Supports request model creation and validation.
 * - Provides built-in validation rules: required, email, minLength, arrayOf, instanceOf, typeOf.
 * - Handles global headers and authentication.
 * - Supports mock responses for testing.
 *
 * @method registerValidationRule(name, fn) Registers or overrides a validation rule.
 * @method getValidationRule(name) Retrieves a validation rule by name.
 * @method listValidationRules() Lists all registered validation rule names.
 * @method addService(service) Adds a new service to the API.
 * @method getService(name) Retrieves a service by name.
 * @method call(fullName, modelOrData, mockResult) Calls an endpoint with data or a request model.
 * @method createRequest(fullName, data) Creates and validates a request model for an endpoint.
 * @method addHeader(name, value) Adds a global header.
 * @method getHeaders() Returns the global headers map.
 */
class TurtlAPI {
  /**
   * Creates a new TurtlAPI instance with configuration and built-in validation rules.
   *
   * @param {Object} config - Configuration object
   * @param {string} config.host - The API host URL
   * @param {Function} [config.getAuthToken=null] - Optional function to retrieve authentication token
   * @param {boolean} [config.mock=false] - Whether to use mock mode
   *
   * @description
   * Initializes the TurtlAPI module with:
   * - Service registry (Map)
   * - Validation rules registry (Map)
   * - Headers registry (Map)
   *
   * Registers the following built-in validation rules:
   * - `required`: Validates that a field is not empty/null/undefined
   * - `email`: Validates email format using regex pattern
   * - `minLength`: Validates minimum string length
   * - `arrayOf`: Validates array items match specified type (primitive or class instance)
   * - `instanceOf`: Validates value is instance of specified class
   * - `typeOf`: Validates value matches specified primitive type
   */
  constructor({ host, getAuthToken = null, mock = false }) {
    this.host = host;
    this.getAuthToken = getAuthToken;
    this.services = new Map();
    this.validationRules = new Map();
    this.mock = mock;
    this.headers = new Map();

    // Register built-in validation rules
    this.registerValidationRule("required", (value, instance, options) => {
      if (value === undefined || value === null || value === "") {
        return TurtlResponse.Error(
          instance.getErrorMessage(0, "Field is required.", options)
        );
      }
      return TurtlResponse.Success();
    });
    this.registerValidationRule("email", (value, instance, options) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return TurtlResponse.Error(
          instance.getErrorMessage(0, "Must be a valid email.", options)
        );
      }
      return TurtlResponse.Success();
    });

    this.registerValidationRule("minLength", (value, instance, options) => {
      if (value !== undefined && typeof value === "string") {
        if (value.length < (options.length || 0)) {
          return TurtlResponse.Error(
            instance.getErrorMessage(
              0,
              `Minimum length is ${options.length}.`,
              options
            )
          );
        }
      }
      return TurtlResponse.Success();
    });
    this.registerValidationRule("arrayOf", (value, instance, options) => {
      const { type, isTypeClass = false } = options || {};
      if (!Array.isArray(value)) {
        return TurtlResponse.Error(
          instance.getErrorMessage(0, "Value must be an array.", options)
        );
      }
      if (!type) {
        return TurtlResponse.Error("No type specified for arrayOf rule.");
      }
      for (const item of value) {
        if (isTypeClass) {
          // Check if item is an instance of the specified class
          if (!(item instanceof type)) {
            return TurtlResponse.Error(
              instance.getErrorMessage(
                2,
                `Array item must be an instance of '${
                  type.name
                }', but got '${typeof item}'.`,
                options
              )
            );
          }
        } else {
          // Check if item is of the specified type
          if (typeof item !== type) {
            return TurtlResponse.Error(
              instance.getErrorMessage(
                3,
                `Array item must be of type '${type}', but got '${typeof item}'.`,
                options
              )
            );
          }
        }
      }
      return TurtlResponse.Success();
    });
    this.registerValidationRule("instanceOf", (value, instance, options) => {
      const type = options.type || null;
      if (!type) {
        return TurtlResponse.Error("No type specified for InstanceOf rule.");
      }
      if (!(value instanceof type)) {
        return TurtlResponse.Error(
          instance.getErrorMessage(
            0,
            `Value must be an instance of '${
              type.name
            }', but got '${typeof value}'.`,
            options
          )
        );
      }
      return TurtlResponse.Success();
    });
    this.registerValidationRule("typeOf", (value, instance, options) => {
      const type = options.type || null;
      if (!type) {
        return TurtlResponse.Error("No type specified for TypeOf rule.");
      }
      if (typeof value !== type) {
        return TurtlResponse.Error(
          instance.getErrorMessage(
            0,
            `Value must be of type '${type}', but got '${typeof value}'.`,
            options
          )
        );
      }
      return TurtlResponse.Success();
    });
  }

  /**
   * Registers a new validation rule, overrides any rule that has the same name.
   *
   * @param {string} name - Name of the validation rule
   * @param {CallableFunction} fn - Validation function, should return TurtlResponse in all cases
   */
  registerValidationRule(name, fn) {
    if (name in this.validationRules) {
      console.warn(
        `[TurtlAPI] Validation rule '${name}' is already registered. Overwriting.`
      );
    }

    this.validationRules.set(name, fn);
  }

  /**
   * Gets a validation rule by name.
   *
   * @param {string} name - Name of the validation rule
   * @returns {CallableFunction} - The validation function
   *
   * @throws {Error} - If the validation rule is not found
   */
  getValidationRule(name) {
    if (!this.validationRules.has(name)) {
      throw new Error(`Validation rule not found: ${name}`);
    }
    return this.validationRules.get(name);
  }

  /**
   * Lists all registered validation rule
   *
   * @returns {string[]} - Array of validation rule names
   */
  listValidationRules() {
    return Array.from(this.validationRules.keys());
  }

  static async #sendRequest(
    method,
    url,
    body,
    requiresAuth,
    getAuthToken,
    headers = {}
  ) {
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

      for (const key in headers) {
        xhr.setRequestHeader(key, headers[key]);
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
      xhr.ontimeout = () => resolve(TurtlResponse.Error("Request timed out."));

      xhr.send(JSON.stringify(body));
    });
  }

  /**
   * Call an endpoint
   *
   * @async
   * @param {string} fullName - endpoint name in format of serviceName.Endpoint
   * @param {{}} [modelOrData={}] - an object with data or model created with `TurtleAPI.CreateRequest`
   * @param {boolean} [mockResult=false] - whether to return a mock success or failure response (only in mock mode)
   * @returns {TurtlResponse} - response from the endpoint or error response
   */
  async call(fullName, modelOrData = {}, mockResult = false) {
    const data = this.#getDataFromFullName(fullName);
    if (data.Failed) {
      return data.Response;
    }
    const service = data.Service;
    const endpoint = data.Endpoint;

    for (const [key, value] of this.headers) {
      if (key in endpoint.headers == false) {
        endpoint.headers[key] = value;
      }
    }

    const isModel =
      modelOrData._schema != undefined &&
      typeof modelOrData._schema === "object";
    if (isModel) {
      return await this.#callWithModel(
        modelOrData,
        service,
        endpoint,
        mockResult
      );
    } else {
      return await this.#callWithData(
        modelOrData,
        service,
        endpoint,
        mockResult
      );
    }
  }

  async #callWithData(data, service, endpoint, mockResult) {
    const modelFactory = service.getModel(endpoint.modelName);
    if (
      modelFactory &&
      modelFactory.create &&
      typeof modelFactory.create === "function"
    ) {
      const requestModel = modelFactory.create(data, this); // Inject api here
      return await this.#callWithModel(
        requestModel,
        service,
        endpoint,
        mockResult
      );
    }
    return TurtlResponse.Error("Invalid data");
  }

  async #callWithModel(requestModel, service, endpoint, mockResult) {
    if (!requestModel.isValid) {
      return requestModel.validateResult;
    }
    return await this.#prepareSendRequest(
      requestModel,
      service,
      endpoint,
      mockResult
    );
  }

  async #createMockResponse(endpoint, service, mockResult, model, response) {
    console.groupCollapsed(
      `%cMOCK ${endpoint.method} ${service.basePath}${endpoint.path}`,
      "color:#9b59b6;font-weight:bold"
    );

    console.log("Request model:", model.toDataObject());
    console.log("Mock result:", mockResult ? "success" : "failure");
    console.log("Response:", response);

    console.groupEnd();
    return response;
  }

  async #prepareSendRequest(model, service, endpoint, mockResult) {
    if (this.mock) {
      if (mockResult) {
        // If endpoint has a mockResponse, use it
        if (typeof endpoint.mockResponseSuccess === "function") {
          return this.#createMockResponse(
            endpoint,
            service,
            mockResult,
            model,
            await endpoint.mockResponseSuccess(model)
          );
        }
        if (
          endpoint.mockResponseSuccess !== undefined &&
          endpoint.mockResponseSuccess !== null
        ) {
          return this.#createMockResponse(
            endpoint,
            service,
            mockResult,
            model,
            typeof endpoint.mockResponseSuccess.then === "function"
              ? await endpoint.mockResponseSuccess
              : endpoint.mockResponseSuccess
          );
        }
        // Default mock response
        return this.#createMockResponse(
          endpoint,
          service,
          mockResult,
          model,
          TurtlResponse.Success("Mocked response", {})
        );
      } else {
        // If endpoint has a mockResponseFailure, use it
        if (typeof endpoint.mockResponseFailure === "function") {
          return this.#createMockResponse(
            endpoint,
            service,
            mockResult,
            model,
            await endpoint.mockResponseFailure(model)
          );
        }
        if (
          endpoint.mockResponseFailure !== undefined &&
          endpoint.mockResponseFailure !== null
        ) {
          return this.#createMockResponse(
            endpoint,
            service,
            mockResult,
            model,
            typeof endpoint.mockResponseFailure.then === "function"
              ? await endpoint.mockResponseFailure
              : endpoint.mockResponseFailure
          );
        }
        // Default mock failure response
        return this.#createMockResponse(
          endpoint,
          service,
          mockResult,
          model,
          TurtlResponse.Error("Mocked failure response")
        );
      }
    }

    const url = `${this.host}${service.basePath}${endpoint.path}`;
    const method = endpoint.method;
    const headers = endpoint.headers || {};
    try {
      return await TurtlAPI.#sendRequest(
        method,
        url,
        model.toDataObject(),
        endpoint.requiresAuth,
        this.getAuthToken,
        headers
      );
    } catch (error) {
      return TurtlResponse.Error("Request failed");
    }
  }

  /**
   * Add a new service to the api
   *
   * @param {TurtlAPIService} service
   */
  addService(service) {
    if (!service || !service.name) {
      throw new Error("Service must have a 'name' property.");
    }
    this.services.set(service.name, service);
  }

  /**
   * Get a service by name
   *
   * @param {string} name - Name of the service
   * @returns {TurtlAPIService} - The service instance
   */
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
      output.Response = TurtlResponse.Error(
        `Service '${serviceName}' not found.`
      );
      return output;
    }
    output.Service = service;

    const endpoint = service.getEndpoint(endpointName);
    if (!endpoint) {
      output.Response = TurtlResponse.Error(
        `Endpoint '${endpointName}' not found in service '${serviceName}'.`
      );
      return output;
    }
    output.Endpoint = endpoint;
    output.Failed = false;
    return output;
  }

  /**
   * Create and validate a request model before calling the endpoint
   *
   * @param {string} fullName - endpoint name in format of serviceName.Endpoint
   * @param {object} data - data to populate the request model
   * @returns {TurtlRequestModel | TurtlResponse} - The request model instance or error response
   */
  createRequest(fullName, data) {
    try {
      const internal = this.#getDataFromFullName(fullName);
      if (internal.Failed) {
        return internal.Response;
      }
      const modelFactory = internal.Service.getModel(
        internal.Endpoint.modelName
      );
      if (
        modelFactory &&
        modelFactory.create &&
        typeof modelFactory.create === "function"
      ) {
        return modelFactory.create(data, this); // Inject api here
      }
      throw new Error(`Failed to create request '${fullName}'.`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add a header to the global api header list
   *
   * @param {string} name - header name
   * @param {string} value - header value
   */
  addHeader(name, value) {
    this.headers.set(name, value);
  }

  /**
   * Returns the header map
   *
   * @returns {Map<string,string>} - headers map
   */
  getHeaders() {
    return this.headers;
  }
}

export {
  TurtlAPI,
  TurtlAPIService,
  TurtlEndpoint,
  TurtlRequestModel,
  TurtlResponse,
};
//# sourceMappingURL=turtl-js-api.mjs.map
