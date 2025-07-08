import { TTResponse } from "./TTResponse.js";

export class TTRequestModel {
    constructor(data = {}, schema = {}, customValidator = null) {
        this._schema = schema;
        this._customValidator = customValidator;

        // Copy data onto the instance
        Object.assign(this, data);

        // Run validation
        const result = TTRequestModel.validateFields(schema, this);
        const custom = customValidator ? customValidator(this) : null;

        if (!result.success) {
            this.validateResult = result;
            this.isValid = false;
        } else if (custom && !custom.success) {
            this.validateResult = custom;
            this.isValid = false;
        } else {
            this.validateResult = TTResponse.Success("Validation successful");
            this.isValid = true;
        }
    }

    static validateFields(schema, instance) {
        for (const key in schema) {
            const rules = schema[key];
            const value = instance[key];

            if (rules.required && (value === undefined || value === null || value === "")) {
                return TTResponse.Error(`${key} is required.`);
            }

            if (rules.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return TTResponse.Error(`${key} must be a valid email.`);
            }

            if (rules.type === "number" && typeof value !== "number") {
                return TTResponse.Error(`${key} must be a number.`);
            }

            if (rules.type === "string" && typeof value !== "string") {
                return TTResponse.Error(`${key} must be a string.`);
            }

            if (rules.validator) {
                const result = rules.validator(value, instance);
                if (result instanceof TTResponse && !result.success) {
                    return result;
                }
            }
        }

        return TTResponse.Success();
    }

    toDataObject() {
        const cleaned = {};
        for (const key in this) {
            if (!["_schema", "_customValidator", "validateResult", "isValid"].includes(key)) {
                cleaned[key] = this[key];
            }
        }
        return cleaned;
    }

    static createFactory(schema, customValidator = null) {
        return {
            create(data = {}) {
                return new TTRequestModel(data, schema, customValidator);
            }
        };
    }
}
