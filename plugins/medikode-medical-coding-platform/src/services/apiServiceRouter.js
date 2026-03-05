const fetch = globalThis.fetch;

/**
 * API Service Router - Routes requests to the correct API service based on environment
 */
class ApiServiceRouter {
    constructor() {
        this.prodApiUrl = process.env.PROD_API_SERVICE_URL || 'http://api-service:8000';
        this.sandboxApiUrl = process.env.SANDBOX_API_SERVICE_URL || 'http://api-service-sandbox:8000';
    }

    getApiServiceUrl(environment) {
        return environment === 'prod' ? this.prodApiUrl : this.sandboxApiUrl;
    }

    async forwardRequest(environment, endpoint, method = 'POST', body = null, headers = {}) {
        const apiUrl = this.getApiServiceUrl(environment);
        const fullUrl = `${apiUrl}${endpoint}`;
        const requestOptions = {
            method,
            headers: { 'Content-Type': 'application/json', ...headers }
        };
        if (body && (method === 'POST' || method === 'PUT')) {
            requestOptions.body = JSON.stringify(body);
        }
        const response = await fetch(fullUrl, requestOptions);
        if (!response.ok) throw new Error(`API service error: ${response.status} ${response.statusText}`);
        return response.json();
    }

    async processChart(environment, requestData, apiKey) {
        return this.forwardRequest(environment, '/process-chart', 'POST', requestData, { 'x-api-key': apiKey });
    }

    async validateCodes(environment, requestData, apiKey) {
        return this.forwardRequest(environment, '/validate', 'POST', requestData, { 'x-api-key': apiKey });
    }

    async calculateRaf(environment, requestData, apiKey) {
        return this.forwardRequest(environment, '/calculate-raf', 'POST', requestData, { 'x-api-key': apiKey });
    }

    async qaValidateCodes(environment, requestData, apiKey) {
        return this.forwardRequest(environment, '/qavalidator', 'POST', requestData, { 'x-api-key': apiKey });
    }

    async parseEob(environment, requestData, apiKey) {
        return this.forwardRequest(environment, '/eobparser', 'POST', requestData, { 'x-api-key': apiKey });
    }
}

module.exports = new ApiServiceRouter();
