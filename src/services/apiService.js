// src/services/apiService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    // Handle query parameters
    let url = `${this.baseURL}${endpoint}`;
    if (options.params) {
      const searchParams = new URLSearchParams(options.params);
      url += `?${searchParams.toString()}`;
      delete options.params; // Remove params from options to avoid sending in body
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Enhanced error handling with status categorization
        const errorData = await response.text();
        let parsedError;
        try {
          parsedError = JSON.parse(errorData);
        } catch {
          parsedError = { message: errorData };
        }
        
        const error = new Error(`API Error: ${response.status} - ${response.statusText}`);
        error.status = response.status;
        error.data = parsedError;
        error.isNetworkError = false;
        throw error;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        // Network error
        const networkError = new Error('Network error: Unable to connect to server');
        networkError.isNetworkError = true;
        networkError.originalError = error;
        throw networkError;
      }
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Properties API
  async getProperties(params = {}) {
    return this.request('/api/properties', { params });
  }

  async getProperty(id) {
    return this.request(`/api/properties/${id}`);
  }

  async createProperty(propertyData) {
    return this.request('/api/properties', {
      method: 'POST',
      body: propertyData,
    });
  }

  async updateProperty(id, propertyData) {
    return this.request(`/api/properties/${id}`, {
      method: 'PUT',
      body: propertyData,
    });
  }

  async deleteProperty(id) {
    return this.request(`/api/properties/${id}`, {
      method: 'DELETE',
    });
  }

  async createProperties(propertiesArray) {
    return this.request('/api/properties/batch', {
      method: 'POST',
      body: { properties: propertiesArray },
    });
  }

  // Tenants API
  async getTenants(params = {}) {
    return this.request('/api/tenants', { params });
  }

  async getTenant(id) {
    return this.request(`/api/tenants/${id}`);
  }

  async createTenant(tenantData) {
    return this.request('/api/tenants', {
      method: 'POST',
      body: tenantData,
    });
  }

  async updateTenant(id, tenantData) {
    return this.request(`/api/tenants/${id}`, {
      method: 'PUT',
      body: tenantData,
    });
  }

  async deleteTenant(id) {
    return this.request(`/api/tenants/${id}`, {
      method: 'DELETE',
    });
  }

  async getTenantsByProperty(propertyId) {
    return this.request('/api/tenants', {
      params: { property: propertyId }
    });
  }

  // Work Orders API
  async getWorkOrders(params = {}) {
    return this.request('/api/workorders', { params });
  }

  async getWorkOrder(id) {
    return this.request(`/api/workorders/${id}`);
  }

  async createWorkOrder(workOrderData) {
    return this.request('/api/workorders', {
      method: 'POST',
      body: workOrderData,
    });
  }

  async updateWorkOrder(id, workOrderData) {
    return this.request(`/api/workorders/${id}`, {
      method: 'PUT',
      body: workOrderData,
    });
  }

  async deleteWorkOrder(id) {
    return this.request(`/api/workorders/${id}`, {
      method: 'DELETE',
    });
  }

  async getWorkOrdersByProperty(propertyId) {
    return this.request('/api/workorders', {
      params: { property: propertyId }
    });
  }

  async updateWorkOrderStatus(id, status) {
    return this.request(`/api/workorders/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  // Transactions API
  async getTransactions(params = {}) {
    return this.request('/api/transactions', { params });
  }

  async getTransaction(id) {
    return this.request(`/api/transactions/${id}`);
  }

  async createTransaction(transactionData) {
    return this.request('/api/transactions', {
      method: 'POST',
      body: transactionData,
    });
  }

  async updateTransaction(id, transactionData) {
    return this.request(`/api/transactions/${id}`, {
      method: 'PUT',
      body: transactionData,
    });
  }

  async deleteTransaction(id) {
    return this.request(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Documents API (local-first approach)
  async getDocuments(params = {}) {
    return this.request('/api/documents', { params });
  }

  async createDocument(documentData) {
    return this.request('/api/documents', {
      method: 'POST',
      body: documentData,
    });
  }

  async updateDocument(id, documentData) {
    return this.request(`/api/documents/${id}`, {
      method: 'PUT',
      body: documentData,
    });
  }

  async deleteDocument(id) {
    return this.request(`/api/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async addDocument(document) {
    return await apiService.request('/api/documents', {
      method: 'POST',
      body: document
    });
  }

  // Applications API
  async getApplications(params = {}) {
    return this.request('/api/applications', { params });
  }

  async getApplication(id) {
    return this.request(`/api/applications/${id}`);
  }

  async createApplication(applicationData) {
    return this.request('/api/applications', {
      method: 'POST',
      body: applicationData,
    });
  }

  async updateApplication(id, applicationData) {
    return this.request(`/api/applications/${id}`, {
      method: 'PUT',
      body: applicationData,
    });
  }

  async deleteApplication(id) {
    return this.request(`/api/applications/${id}`, {
      method: 'DELETE',
    });
  }

  async updateApplicationStatus(id, status) {
    return this.request(`/api/applications/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async convertApplicationToTenant(id) {
    return this.request(`/api/applications/${id}/convert`, {
      method: 'POST',
    });
  }

  // Utility methods
  async healthCheck() {
    return this.request('/api/health');
  }

  async syncData(data) {
    return this.request('/api/sync', {
      method: 'POST',
      body: data,
    });
  }

  // NEW: Bulk localStorage sync endpoint
  async syncLocalStorageData(localStorageData) {
    return this.request('/api/sync/localstorage', {
      method: 'POST',
      body: localStorageData,
    });
  }
}

export const apiService = new ApiService();
export default apiService;