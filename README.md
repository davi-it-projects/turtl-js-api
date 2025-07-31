# Turtl JS API
`Turtl JS API` is a lightweight and flexible module that helps you build structured, model-driven API clients in JavaScript. It supports validation, authentication, and dynamic service/endpoint configuration, enabling consistent request modeling and response handling.

### ✨ Features
* Modular design: define services, models, and endpoints separately
* Custom validation rules
* Request/response abstraction with built-in helpers
* Support for authenticated and unauthenticated endpoints
* Lightweight – no external dependencies

# 📦 Installation

You can include it in your project via CDN
#### Using CDN
```js
<script type="module">
import {
    TurtlAPI,
    TurtlAPIService,
    TurtlEndpoint,
    TurtlRequestModel,
    TurtlResponse
} from 'https://cdn.jsdelivr.net/gh/davi-it-projects/turtl-js-api@latest/dist/turtl-js-api.mjs';
</script>
```

this client aims to always return the response in the same format (`TurtleResponse`):
```js
{
    "success":bool,
    "message":string,
    "data":object
}
```

# 🚀 Quick Start
1. Create an API Client
```js
const api = new TurtlAPI({
    host: "https://example.com/api/",
    getAuthToken: () => localStorage.getItem("SessionKey") // or any other method
});
```
2. Define a Service
```js
const accountService = new TurtlAPIService("account", "/account");
```

3. Add Request Models
```js
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
```
4. Define Endpoints
```js
accountService.addEndpoint("login", {
    path: "/login.php",
    method: "POST",
    modelName: "login",
    requiresAuth: false
});
```
5. Register the Service with the API
```js
api.addService("account", accountService);
```
6. Make Requests
```js
const request = api.createRequest("account.login", {
    email: "user@example.com",
    password: "123456"
});

const response = await api.call("account.login", request);
```


# ✅ Validation Rules Reference

Turtl JS API includes a set of built-in validation rules that can be used in request models to ensure data integrity before requests are sent to the server. You can also register your own rules.
## 🛠️ Usage Example
```js
TurtlRequestModel.createFactory({
    email: [
        { rule: "required" },
        { rule: "email" }
    ],
    age: [
        { rule: "number" },
        { rule: "minLength", options: { length: 1 } }
    ]
});
```

## Built-in Rules
`required`

Ensures the field is not undefined, null, or an empty string.
```
{ rule: "required" }
```
Fails when:

    The value is undefined, null, or "".

`email`

Validates the value is a syntactically correct email address.
```
{ rule: "email" }
```
Fails when:

    The value is a string but not in valid email format like "user@example.com".

`typeOf`

Ensures the value is of a given type
```
{ rule: "typeOf", options: { type: "string"}}
```
Fails when:

    The value si of a diffrent type

`minLength`

Ensures a string has at least a certain number of characters.
```
{ rule: "minLength", options: { length: 3 } }
```
Fails when:

    The value is a string shorter than the specified length.

Note: Has no effect if the value is undefined.
`arrayOf`

Validates the field is an array of items with a specific primitive type or class instance.
```
// Array of strings
{ rule: "arrayOf", options: { type: "string" } }

// Array of instances
{ rule: "arrayOf", options: { type: MyClass, isTypeClass: true } }
```
Fails when:

    The value is not an array

    The items do not match the expected type

`instanceOf`

Validates the field is an instance of a given class.
```
{ rule: "instanceOf", options: { type: MyClass } }
```
Fails when:

    The value is not an instance of the provided constructor/class.

## Custom Rules
You can register your own rules using:
```js
api.registerValidationRule("myRule", (value, instance, options) => {
    // return TurtlResponse.Success() or TurtlResponse.Error("message")
});
```
`"myRule"` is the name of the rule  
`value` this variable contains the value of the vield the rule is being run on  
`instance` the full request object, usefull for when you want to do complex validation (for example cross field vallidation)
`options` the options that were given

IMPORTANT: a validation rule should always return a `TurtlResponse` either via the `Error(message)` method or the `Success()` method

### example
```js
api.registerValidationRule("even", (value, instance, options) => {
    if (value % 2 == 0){
        return TurtlResponse.Success()
    }
    else{
        return TurtlResponse.Error("Odd Numbers are not allowed!")
    }
});
```
Use it in a model like this:
```js
someService.addModel("example", TurtlRequestModel.createFactory({
    number: [{ rule: "even" }]
}));
```