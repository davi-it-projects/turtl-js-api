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
export class TurtlEndpoint {
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
