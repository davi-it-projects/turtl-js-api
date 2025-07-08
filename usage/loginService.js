import { TurtlAPIService } from "../Module/TurtlAPIService.js";
import { TurtlRequestModel } from "../Module/TurtlRequestModel.js";

const accountService = new TurtlAPIService("account", "/account");

accountService.addModel('login',TurtlRequestModel.createFactory({
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
