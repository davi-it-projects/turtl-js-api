import { TurtlAPIService } from "./TurtlAPIService.js";
import { TurtlRequestModel } from "./TurtlRequestModel.js";
import { TurtlResponse } from "./TurtlResponse.js";

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
export class TurtlAPI {
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
      
      // Handle GET requests with query parameters
      let finalUrl = url;
      if (method.toUpperCase() === "GET" && body && Object.keys(body).length > 0) {
        const params = new URLSearchParams(body);
        finalUrl = `${url}?${params.toString()}`;
      }
      
      xhr.open(method, finalUrl);
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

      // Only send body for non-GET requests
      const sendBody = method.toUpperCase() !== "GET" ? JSON.stringify(body) : null;
      xhr.send(sendBody);
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
