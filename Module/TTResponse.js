export class TTResponse {
    constructor(success = false, message = "", data = {}) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    static fromJson(json) {
        return new TTResponse(
            json.success ?? false,
            json.message ?? "",
            json.data ?? {},
        );
    }

    static Error(message) {
        return new TTResponse(false, message);
    }

    static Success(message = "", data = {}) {
        return new TTResponse(true, message, data);
    }
}
