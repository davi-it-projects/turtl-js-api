import { TurtlResponse } from "./TurtlResponse.js";

export class TurtlRequestModel {
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
