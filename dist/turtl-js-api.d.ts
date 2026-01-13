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
declare class TurtlResponse {
    static fromJson(json: any): TurtlResponse;
    static Error(message: any): TurtlResponse;
    static Success(message?: string, data?: {}): TurtlResponse;
    constructor(success?: boolean, message?: string, data?: {});
    success: boolean;
    message: string;
    data: {};
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
declare class TurtlRequestModel {
    static validateFields(schema: any, instance: any, api: any): TurtlResponse;
    /**
     * Creates a factory object for generating instances of TurtlRequestModel.
     *
     * @param {Object} schema - The schema definition for the request model.
     * @param {Function|null} [customValidator=null] - Optional custom validation function.
     * @returns {{create: function(Object=, Object=): TurtlRequestModel}} Factory object with a `create` method.
     */
    static createFactory(schema: any, customValidator?: Function | null): {
        create: (arg0: any | undefined, arg1: any | undefined) => TurtlRequestModel;
    };
    constructor(data?: {}, schema?: {}, customValidator?: any, api?: any);
    _schema: {};
    _customValidator: any;
    _api: any;
    validateResult: any;
    isValid: boolean;
    getErrorMessage(index: any, defaultMessage: any, options: any): any;
    toDataObject(): {};
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
declare class TurtlAPIService {
    /**
     * Creates an instance of TurtlAPIService.
     *
     * @constructor
     * @param {string} name - service name
     * @param {string} basePath - base path for the service
     */
    constructor(name: string, basePath: string);
    name: string;
    basePath: string;
    endpoints: any;
    Models: any;
    headers: any;
    /**
     * Add an endpoint to the service
     *
     * @param {string} name - endpoint name
     * @param {object} config - endpoint configuration
     */
    addEndpoint(name: string, config: object): void;
    /**
     * Gets a endpoint by name
     *
     * @param {string} name - endpoint name
     * @returns {object} - endpoint configuration with Service headers applied
     */
    getEndpoint(name: string): object;
    /**
     * Add a model to the Service
     *
     * @param {string} name - model name
     * @param {TurtlRequestModel | Object} model - model class
     */
    addModel(name: string, model: TurtlRequestModel | any): void;
    /**
     * Get a model by a name
     *
     * @param {string} name - model name
     * @returns {TurtlRequestModel} - model class
     */
    getModel(name: string): TurtlRequestModel;
    /**
     * Add header to the Service
     *
     * @param {string} name - header name
     * @param {string} value - header value
     */
    addHeader(name: string, value: string): void;
    /**
     * Get the Map of headers on this service
     *
     * @returns {Map<string,string>} - headers map
     */
    getHeaders(): Map<string, string>;
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
declare class TurtlAPI {
    static "__#private@#sendRequest"(method: any, url: any, body: any, requiresAuth: any, getAuthToken: any, headers?: {}): Promise<any>;
    /**
     * Creates a new TurtlAPI instance with configuration and built-in validation rules.
     *
     * @param {Object} config - Configuration object
     * @param {string} config.host - The API host URL
     * @param {Function} [config.getAuthToken=null] - Optional function to retrieve authentication token
     * @param {boolean} [config.mock=false] - Whether to use mock mode
     * @param {boolean} [config.defaultMockResultmock=false] - What mock result to use in default
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
    constructor({ host, getAuthToken, mock, defaultMockResult, }: {
        host: string;
        getAuthToken?: Function;
        mock?: boolean;
        defaultMockResultmock?: boolean;
    });
    host: string;
    getAuthToken: Function;
    services: any;
    validationRules: any;
    mock: boolean;
    defaultMockResult: any;
    headers: any;
    Models: any;
    /**
     * Registers a new validation rule, overrides any rule that has the same name.
     *
     * @param {string} name - Name of the validation rule
     * @param {CallableFunction} fn - Validation function, should return TurtlResponse in all cases
     */
    registerValidationRule(name: string, fn: CallableFunction): void;
    /**
     * Gets a validation rule by name.
     *
     * @param {string} name - Name of the validation rule
     * @returns {CallableFunction} - The validation function
     *
     * @throws {Error} - If the validation rule is not found
     */
    getValidationRule(name: string): CallableFunction;
    /**
     * Lists all registered validation rule
     *
     * @returns {string[]} - Array of validation rule names
     */
    listValidationRules(): string[];
    /**
     * Call an endpoint
     *
     * @async
     * @param {string} fullName - endpoint name in format of serviceName.Endpoint
     * @param {{}} [modelOrData={}] - an object with data or model created with `TurtleAPI.CreateRequest`
     * @param {boolean} [mockResult=false] - whether to return a mock success or failure response (only in mock mode)
     * @returns {TurtlResponse} - response from the endpoint or error response
     */
    call(fullName: string, modelOrData?: {}, mockResult?: boolean): TurtlResponse;
    /**
     * Add a model to the Service
     *
     * @param {string} name - model name
     * @param {TurtlRequestModel | Object} model - model class
     */
    addModel(name: string, model: TurtlRequestModel | any): void;
    /**
     * Get a model by a name
     *
     * @param {string} name - model name
     * @returns {TurtlRequestModel} - model class
     */
    getModel(name: string): TurtlRequestModel;
    /**
     * Add a new service to the api
     *
     * @param {TurtlAPIService} service
     */
    addService(service: TurtlAPIService): void;
    /**
     * Get a service by name
     *
     * @param {string} name - Name of the service
     * @returns {TurtlAPIService} - The service instance
     */
    getService(name: string): TurtlAPIService;
    /**
     * Create and validate a request model before calling the endpoint
     *
     * @param {string} fullName - endpoint name in format of serviceName.Endpoint
     * @param {object} data - data to populate the request model
     * @returns {TurtlRequestModel | TurtlResponse} - The request model instance or error response
     */
    createRequest(fullName: string, data: object): TurtlRequestModel | TurtlResponse;
    /**
     * Add a header to the global api header list
     *
     * @param {string} name - header name
     * @param {string} value - header value
     */
    addHeader(name: string, value: string): void;
    /**
     * Returns the header map
     *
     * @returns {Map<string,string>} - headers map
     */
    getHeaders(): Map<string, string>;
    #private;
}

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
declare class TurtlEndpoint {
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
    constructor({ name, path, method, modelName, requiresAuth, mockResponseSuccess, mockResponseFailure, headers, }: {
        name: string;
        path: string;
        method?: string;
        modelName?: string;
        requiresAuth?: boolean;
        mockResponseSuccess?: any;
        mockResponseFailure?: any;
        headers?: any;
    });
    name: string;
    path: string;
    method: string;
    modelName: string;
    requiresAuth: boolean;
    mockResponseSuccess: any;
    mockResponseFailure: any;
    headers: any;
}

export { TurtlAPI, TurtlAPIService, TurtlEndpoint, TurtlRequestModel, TurtlResponse };
