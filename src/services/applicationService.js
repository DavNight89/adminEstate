// src/services/applicationService.js

/**
 * Application Service
 * Handles all API calls related to tenant applications
 * Supports offline-first architecture with localStorage caching
 */

const API_BASE_URL = 'http://localhost:5000/api';

class ApplicationService {
  constructor() {
    this.storageKey = 'applications';
  }

  /**
   * Get all applications with optional filters
   */
  async getApplications(filters = {}) {
    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.propertyId) params.append('propertyId', filters.propertyId);
      if (filters.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = `${API_BASE_URL}/applications${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Cache in localStorage
        this.saveToLocalStorage(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);

      // Fallback to localStorage if API fails
      return this.getFromLocalStorage(filters);
    }
  }

  /**
   * Get single application by ID
   */
  async getApplication(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Application not found');
      }
    } catch (error) {
      console.error('Error fetching application:', error);

      // Fallback to localStorage
      const applications = this.getFromLocalStorage();
      return applications.find(app => app.id === id) || null;
    }
  }

  /**
   * Create new application
   */
  async createApplication(applicationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Add to localStorage
        const applications = this.getFromLocalStorage();
        applications.push(result.data);
        this.saveToLocalStorage(applications);

        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create application');
      }
    } catch (error) {
      console.error('Error creating application:', error);

      // Save to localStorage for offline support
      const newApplication = {
        ...applicationData,
        id: applicationData.id || Date.now(),
        status: 'submitted',
        submittedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _pendingSync: true, // Mark for sync when online
      };

      const applications = this.getFromLocalStorage();
      applications.push(newApplication);
      this.saveToLocalStorage(applications);

      return newApplication;
    }
  }

  /**
   * Update application
   */
  async updateApplication(id, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update localStorage
        const applications = this.getFromLocalStorage();
        const index = applications.findIndex(app => app.id === id);
        if (index !== -1) {
          applications[index] = result.data;
          this.saveToLocalStorage(applications);
        }

        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);

      // Update localStorage for offline support
      const applications = this.getFromLocalStorage();
      const index = applications.findIndex(app => app.id === id);

      if (index !== -1) {
        applications[index] = {
          ...applications[index],
          ...updates,
          updatedAt: new Date().toISOString(),
          _pendingSync: true,
        };
        this.saveToLocalStorage(applications);
        return applications[index];
      }

      throw error;
    }
  }

  /**
   * Delete application
   */
  async deleteApplication(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Remove from localStorage
        const applications = this.getFromLocalStorage();
        const filtered = applications.filter(app => app.id !== id);
        this.saveToLocalStorage(filtered);

        return true;
      } else {
        throw new Error(result.error || 'Failed to delete application');
      }
    } catch (error) {
      console.error('Error deleting application:', error);

      // Mark for deletion in localStorage
      const applications = this.getFromLocalStorage();
      const index = applications.findIndex(app => app.id === id);

      if (index !== -1) {
        applications[index]._pendingDelete = true;
        this.saveToLocalStorage(applications);
        return true;
      }

      throw error;
    }
  }

  /**
   * Convert application to tenant
   */
  async convertToTenant(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${id}/convert`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update application in localStorage
        const applications = this.getFromLocalStorage();
        const index = applications.findIndex(app => app.id === id);
        if (index !== -1) {
          applications[index].tenantId = result.data.id;
          applications[index].updatedAt = new Date().toISOString();
          this.saveToLocalStorage(applications);
        }

        return result.data; // Returns the new tenant
      } else {
        throw new Error(result.error || 'Failed to convert application');
      }
    } catch (error) {
      console.error('Error converting application:', error);
      throw error;
    }
  }

  /**
   * Get application statistics
   */
  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/stats`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);

      // Calculate from localStorage
      const applications = this.getFromLocalStorage();
      return {
        total: applications.length,
        submitted: applications.filter(a => a.status === 'submitted').length,
        screening: applications.filter(a => a.status === 'screening').length,
        approved: applications.filter(a => a.status === 'approved').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
        withdrawn: applications.filter(a => a.status === 'withdrawn').length,
      };
    }
  }

  /**
   * Sync pending changes with backend
   */
  async syncPendingChanges() {
    const applications = this.getFromLocalStorage();
    const pendingSync = applications.filter(app => app._pendingSync);
    const pendingDelete = applications.filter(app => app._pendingDelete);

    const results = {
      synced: 0,
      deleted: 0,
      errors: [],
    };

    // Sync updates/creates
    for (const app of pendingSync) {
      try {
        if (app.createdAt === app.updatedAt) {
          // New application, create it
          await this.createApplication(app);
        } else {
          // Existing application, update it
          await this.updateApplication(app.id, app);
        }
        results.synced++;
      } catch (error) {
        results.errors.push({ id: app.id, error: error.message });
      }
    }

    // Sync deletions
    for (const app of pendingDelete) {
      try {
        await this.deleteApplication(app.id);
        results.deleted++;
      } catch (error) {
        results.errors.push({ id: app.id, error: error.message });
      }
    }

    return results;
  }

  /**
   * Save applications to localStorage
   */
  saveToLocalStorage(applications) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(applications));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Get applications from localStorage with optional filters
   */
  getFromLocalStorage(filters = {}) {
    try {
      const stored = localStorage.getItem(this.storageKey);
      let applications = stored ? JSON.parse(stored) : [];

      // Filter out pending deletes
      applications = applications.filter(app => !app._pendingDelete);

      // Apply filters
      if (filters.status) {
        applications = applications.filter(app => app.status === filters.status);
      }

      if (filters.propertyId) {
        applications = applications.filter(app => app.propertyId === filters.propertyId);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        applications = applications.filter(
          app =>
            app.firstName?.toLowerCase().includes(searchLower) ||
            app.lastName?.toLowerCase().includes(searchLower) ||
            app.email?.toLowerCase().includes(searchLower) ||
            app.propertyName?.toLowerCase().includes(searchLower)
        );
      }

      return applications;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  /**
   * Clear all applications from localStorage
   */
  clearLocalStorage() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if online
   */
  isOnline() {
    return navigator.onLine;
  }

  /**
   * Export applications as JSON
   */
  exportAsJSON(applications) {
    const dataStr = JSON.stringify(applications, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `applications_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export applications as CSV
   */
  exportAsCSV(applications) {
    if (applications.length === 0) return;

    // CSV headers
    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Property',
      'Desired Unit',
      'Move-In Date',
      'Monthly Income',
      'Employer',
      'Status',
      'Submitted Date',
    ];

    // CSV rows
    const rows = applications.map(app => [
      app.id,
      `${app.firstName} ${app.lastName}`,
      app.email,
      app.phone,
      app.propertyName,
      app.desiredUnit || '',
      app.desiredMoveInDate,
      app.monthlyIncome,
      app.currentEmployer,
      app.status,
      app.submittedDate,
    ]);

    // Combine
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Download
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
const applicationService = new ApplicationService();
export default applicationService;
