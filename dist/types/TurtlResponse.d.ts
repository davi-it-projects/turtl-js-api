export class TurtlResponse {
    static fromJson(json: any): TurtlResponse;
    static Error(message: any): TurtlResponse;
    static Success(message?: string, data?: {}): TurtlResponse;
    constructor(success?: boolean, message?: string, data?: {});
    success: boolean;
    message: string;
    data: {};
}
