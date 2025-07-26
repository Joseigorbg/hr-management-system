// C:\Users\igorb\hr-management-system\hr-management-frontend\src\services\apiService.js
const API_BASE_URL = '/api'; // Prefixo do proxy, que será roteado para http://localhost:3000

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request(endpoint, options = {}) {
    // Remove qualquer prefixo duplicado e usa apenas o endpoint relativo
    const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.replace(/^\/api/, '') : endpoint;
    const url = `${this.baseURL}${cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`}`;
    
    // Determine if the body is FormData and adjust headers/config accordingly
    const isFormData = options.body instanceof FormData;
    const headers = this.getAuthHeaders();
    const config = {
      headers: isFormData ? headers : { ...headers, 'Content-Type': 'application/json' },
      ...options,
      body: isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data,
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();