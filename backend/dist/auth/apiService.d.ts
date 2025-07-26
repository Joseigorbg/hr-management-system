declare class ApiService {
    private baseUrl;
    private toStringValue;
    request(url: string, { method, data, params, headers }?: {
        method?: string;
        data?: any;
        params?: {};
        headers?: {};
    }): Promise<any>;
    get(url: string, { params, headers }?: {
        params?: {};
        headers?: {};
    }): Promise<any>;
    post(url: string, data: any, { params, headers }?: {
        params?: {};
        headers?: {};
    }): Promise<any>;
    patch(url: string, data: any, { params, headers }?: {
        params?: {};
        headers?: {};
    }): Promise<any>;
}
declare const _default: ApiService;
export default _default;
