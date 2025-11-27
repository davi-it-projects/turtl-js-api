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
export class TurtlRequestModel {
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
import { TurtlResponse } from "./TurtlResponse.js";
