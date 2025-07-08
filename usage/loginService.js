import { APIService } from "../Module/APIService.js";
import { TTRequestModel } from "../Module/TTRequestModel.js";

const accountService = new APIService("account", "/account");

accountService.addModel('login',TTRequestModel.createFactory({
    email: { required: true, type: "email" },
    password: { required: true, type: "string" }
}));

accountService.addEndpoint("login", {
    path: "/login.php",
    method: "POST",
    modelName: 'login',
    requiresAuth: false
});

export { accountService };
