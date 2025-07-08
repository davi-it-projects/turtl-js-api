import { TTAPI } from "../Module/TTAPI.js";
import { accountService } from "./loginService.js";

// Change the host to your local API endpoint
const api = new TTAPI(
    {
        host: "http://jsmodule.local/APIModule/usage/debugAPI",
        getAuthToken: () => localStorage.getItem("SessionKey")
    }
);

api.addService("account", accountService);

//=-=-=-= INCORRECT LOGIN =-=-=-=
const request = api.createRequest("account.login",{
    email: "user@example.com",
    password: "123456"
});

const response = await api.call("account.login", request);
console.log("wrong input",response);

//=-=-=-= INVALID INPUT =-=-=-=
const invalidRequest = api.createRequest("account.login",({
    email: "invalid-email",
    password: ""
}));

const invalidResponse = await api.call("account.login", invalidRequest);
console.log("invalid input",invalidResponse);

//=-=-=-= CORRECT LOGIN =-=-=-=
const correctResponse = await api.call("account.login", {
    email: "debug@example.com",
    password: "debugpass"
});
console.log("correct",correctResponse);