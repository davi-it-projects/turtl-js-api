import {
    TurtlAPI,
    TurtlAPIService,
    TurtlEndpoint,
    TurtlRequestModel,
    TurtlResponse
} from "../Module/index.js";

// Create the API instance
const api = new TurtlAPI({
    host: "http://jsmodule.local/APIModule/usage/debugAPI",
    getAuthToken: () => localStorage.getItem("SessionKey"),
    mock: true
});

// =-=-=-= REGISTER VALIDATION RULES =-=-=-=

api.registerValidationRule("string", (value, _instance, _options) => {
    return typeof value === "string"
        ? TurtlResponse.Success()
        : TurtlResponse.Error("Value must be a piece of text.");
});

// =-=-=-= DEFINE SERVICE & MODELS =-=-=-=
const accountService = new TurtlAPIService("account", "/account");

// Use the new array-based schema with rules by name
accountService.addModel("login", TurtlRequestModel.createFactory({
    email: [
        { rule: "required" },
        { rule: "email" }
    ],
    password: [
        { rule: "required" },
        { rule: "string" }
    ]
}));

accountService.addEndpoint("login", {
    path: "/login.php",
    method: "POST",
    modelName: "login",
    requiresAuth: false,
    mockResponseSuccess: (model) => TurtlResponse.Success("Mock login", { user: { id: 1, email: model.email, name: "Mock User" } }),
    mockResponseFailure: () => TurtlResponse.Error("Mock login failure")
});

api.addService(accountService);

// =-=-=-= INCORRECT LOGIN =-=-=-=
const request = api.createRequest("account.login", {
    email: "user@example.com",
    password: "123456"
});

const response = await api.call("account.login", request);
console.log("wrong input", response);

// =-=-=-= INVALID INPUT =-=-=-=
const invalidRequest = api.createRequest("account.login", {
    email: "invalid-email.com",
    password: ""
});

const invalidResponse = await api.call("account.login", invalidRequest);
console.log("invalid input", invalidResponse);

// =-=-=-= CORRECT LOGIN =-=-=-=
const correctResponse = await api.call("account.login", {
    email: "debug@example.com",
    password: "debugpass"
}
);

console.log("correct", correctResponse);
