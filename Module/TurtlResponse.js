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
export class TurtlResponse {
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
