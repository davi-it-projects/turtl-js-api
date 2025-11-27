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
