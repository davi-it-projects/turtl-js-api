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
    static fromJson(json: any): TurtlResponse;
    static Error(message: any): TurtlResponse;
    static Success(message?: string, data?: {}): TurtlResponse;
    constructor(success?: boolean, message?: string, data?: {});
    success: boolean;
    message: string;
    data: {};
}
