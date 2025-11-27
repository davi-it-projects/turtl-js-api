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
    static "__#private@#sendRequest"(method: any, url: any, body: any, requiresAuth: any, getAuthToken: any, headers?: {}): Promise<any>;
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
    constructor({ host, getAuthToken, mock }: {
        host: string;
        getAuthToken?: Function;
        mock?: boolean;
    });
    host: string;
    getAuthToken: Function;
    services: any;
    validationRules: any;
    mock: boolean;
    headers: any;
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
import { TurtlResponse } from "./TurtlResponse.js";
import { TurtlAPIService } from "./TurtlAPIService.js";
import { TurtlRequestModel } from "./TurtlRequestModel.js";
