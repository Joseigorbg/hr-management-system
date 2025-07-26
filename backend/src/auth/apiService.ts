// src/services/apiService.ts
interface QueryParams {
  [key: string]: string | number | boolean | undefined | null;
}

class ApiService {
  private baseUrl = 'http://localhost:3000/api/v1';

  private toStringValue(value: string | number | boolean | undefined | null): string | null {
    if (value === undefined || value === null) return null;
    return value.toString();
  }

  async request(url: string, { method = 'GET', data = null, params = {}, headers = {} } = {}): Promise<any> {
    const filteredParams = Object.fromEntries(
      Object.entries(params as QueryParams)
        .filter(([key, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, this.toStringValue(value)])
    );
    const queryString = new URLSearchParams(filteredParams as Record<string, string>).toString();
    const fullUrl = queryString ? `${this.baseUrl}${url}?${queryString}` : `${this.baseUrl}${url}`;
    console.log('API Request URL:', fullUrl);

    const response = await fetch(fullUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`, // Ajuste conforme sua autenticação
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

  get(url: string, { params = {}, headers = {} } = {}): Promise<any> {
    return this.request(url, { method: 'GET', params, headers });
  }

  post(url: string, data: any, { params = {}, headers = {} } = {}): Promise<any> {
    return this.request(url, { method: 'POST', data, params, headers });
  }

  patch(url: string, data: any, { params = {}, headers = {} } = {}): Promise<any> {
    return this.request(url, { method: 'PATCH', data, params, headers });
  }
}

export default new ApiService();