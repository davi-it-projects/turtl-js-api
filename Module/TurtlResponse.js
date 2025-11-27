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
