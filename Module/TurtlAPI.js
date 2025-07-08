import {TurtlResponse} from "./TurtlResponse.js";

export class TurtlAPI {
    constructor({ host, getAuthToken = null }) {
        this.host = host;
        this.getAuthToken = getAuthToken;
        this.services = new Map();
    }

    static async sendRequest(method, url, body, requiresAuth, getAuthToken) {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.setRequestHeader("Content-Type", "application/json");

            if (requiresAuth) {
                const token = getAuthToken ? getAuthToken() : null;
                if (token) {
                    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
                } else {
                    resolve(TurtlResponse.Error("Authentication required."));
                    return;
                }
            }

            xhr.onload = () => {
                try {
                    const json = JSON.parse(xhr.responseText);
                    resolve(TurtlResponse.fromJson(json));
                } catch (e) {
                    resolve(TurtlResponse.Error("Invalid response"));
                }
            };

            xhr.onerror = () => resolve(TurtlResponse.Error("Network error"));
            xhr.send(JSON.stringify(body));
        });
    }

    async call(fullName, modelOrData) {
        let data = this.#getDataFromFullName(fullName);
        if (data['Failed']) {
            return data['TurtlResponse'];
        }
        let service = data['Service'];
        let endpoint = data['Endpoint'];

        const isModel = modelOrData && modelOrData._schema && typeof modelOrData._schema === "object";
        return isModel
            ? await this.#callWithModel(modelOrData, service, endpoint)
            : await this.#callWithData(modelOrData, service, endpoint);
    }

    async #callWithData(data, service, endpoint) {
        let model = service.getModel(endpoint.modelName);
        if (model && model.create && typeof model.create === "function") {
            let RequestModel = model.create();
            return await this.#callWithData(RequestModel, service, endpoint);
        }
        return TurtlResponse.Error("Invalid data");
    }

    async #callWithModel(requestModel, service, endpoint) {
        if (!requestModel.isValid) {
            return requestModel.validateResult;
        }

        return await this.#sendRequest(requestModel, service, endpoint);
    }

    async #sendRequest(model, service, endpoint) {
        const url = `${this.host}${service.basePath}${endpoint.path}`;
        const method = endpoint.method;

        try {
            return await TurtlAPI.sendRequest(
                method,
                url,
                model.toDataObject(),
                endpoint.requiresAuth,
                this.getAuthToken
            );
        } catch (error) {
            return TurtlResponse.Error("Request failed");
        }
    }

    addService(name, service) {
        this.services.set(name, service);
    }

    getService(name) {
        return this.services.get(name);
    }

    #getDataFromFullName(fullName){
        const [serviceName, endpointName] = fullName.split(".");
        let output = {
            'Failed':true,
            'Response':null,
            'Service':null,
            'Endpoint':null
        }

        const service = this.getService(serviceName);
        if (!service) {
            output['Response'] = TurtlResponse.Error(`Service '${serviceName}' not found.`);
            return output;
        }
        output['Service'] = service;

        const endpoint = service.getEndpoint(endpointName);
        if (!endpoint) {
            output['Response'] = TurtlResponse.Error(`Endpoint '${endpointName}' not found in service '${serviceName}'.`);
            return output;
        }

        output['Endpoint'] = endpoint;
        output['Failed'] = false;
        return output;
    }

    createRequest(fullName, data) {
        try{
            let InternalData = this.#getDataFromFullName(fullName);
            if (InternalData['Failed']) {
                return InternalData['TurtlResponse'];
            }
            let service = InternalData['Service'];
            let endpoint = InternalData['Endpoint'];
            let model = service.getModel(endpoint.modelName);
            if (model && model.create && typeof model.create === 'function') {
                return model.create(data);
            }
            throw new Error(`Failed to create request '${fullName}'.`);
        }
        catch(error) {
            throw error;
        }
    }

}
