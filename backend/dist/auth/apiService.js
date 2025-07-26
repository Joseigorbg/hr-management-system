"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api/v1';
    }
    toStringValue(value) {
        if (value === undefined || value === null)
            return null;
        return value.toString();
    }
    async request(url, { method = 'GET', data = null, params = {}, headers = {} } = {}) {
        const filteredParams = Object.fromEntries(Object.entries(params)
            .filter(([key, value]) => value !== undefined && value !== null)
            .map(([key, value]) => [key, this.toStringValue(value)]));
        const queryString = new URLSearchParams(filteredParams).toString();
        const fullUrl = queryString ? `${this.baseUrl}${url}?${queryString}` : `${this.baseUrl}${url}`;
        console.log('API Request URL:', fullUrl);
        const response = await fetch(fullUrl, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                ...headers,
            },
            body: data ? JSON.stringify(data) : null,
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        return response.json();
    }
    get(url, { params = {}, headers = {} } = {}) {
        return this.request(url, { method: 'GET', params, headers });
    }
    post(url, data, { params = {}, headers = {} } = {}) {
        return this.request(url, { method: 'POST', data, params, headers });
    }
    patch(url, data, { params = {}, headers = {} } = {}) {
        return this.request(url, { method: 'PATCH', data, params, headers });
    }
}
exports.default = new ApiService();
//# sourceMappingURL=apiService.js.map