import { TurtlEndpoint } from "./TurtlEndpoint.js";
import { TurtlRequestModel } from "./TurtlRequestModel.js";

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
export class TurtlAPIService {
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
