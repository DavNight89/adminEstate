import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Clock, CheckCircle, AlertCircle, XCircle, Wrench } from 'lucide-react';

const MaintenanceList = ({ user, onLogout }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMaintenanceRequests();
  }, [user]);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);

      // Fetch tenant's maintenance requests
      const response = await fetch(`/api/tenant/maintenance?unit=${user?.tenant?.unit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tenantToken')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setRequests(data.data || []);
      } else {
        setError('Failed to load maintenance requests');
      }
    } catch (err) {
      console.error('Error fetching maintenance requests:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in progress':
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'pending_approval':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Wrench className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending_approval':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending_approval':
        return 'Pending Approval';
      case 'approved':
        return 'Approved';
      case 'in_progress':
        return 'In Progress';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
              <p className="text-sm text-gray-600">
                {requests.length} {requests.length === 1 ? 'request' : 'requests'} found
              </p>
            </div>
          </div>
          <Link
            to="/maintenance/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading maintenance requests...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-1">Error Loading Requests</h3>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={fetchMaintenanceRequests}
                  className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && requests.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Maintenance Requests</h3>
            <p className="text-gray-600 mb-6">
              You haven't submitted any maintenance requests yet.
            </p>
            <Link
              to="/maintenance/new"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Submit Your First Request
            </Link>
          </div>
        )}

        {/* Requests List */}
        {!loading && !error && requests.length > 0 && (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {getStatusIcon(request.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {request.title || request.issue}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {request.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                        {request.workOrderId && (
                          <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800">
                            Work Order #{request.workOrderId}
                          </span>
                        )}
                        {request.workOrderStatus && (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(request.workOrderStatus)}`}>
                            {getStatusLabel(request.workOrderStatus)}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority} Priority
                        </span>
                        {request.category && (
                          <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-800">
                            {request.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{formatDate(request.date || request.submittedAt)}</p>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                  {request.location && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="text-sm font-medium text-gray-900">{request.location}</p>
                    </div>
                  )}
                  {request.unit && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Unit</p>
                      <p className="text-sm font-medium text-gray-900">{request.unit}</p>
                    </div>
                  )}
                  {request.property && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Property</p>
                      <p className="text-sm font-medium text-gray-900">{request.property}</p>
                    </div>
                  )}
                  {request.preferredTime && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Preferred Time</p>
                      <p className="text-sm font-medium text-gray-900">{request.preferredTime}</p>
                    </div>
                  )}
                </div>

                {/* Photos */}
                {request.photos && request.photos.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Attached Photos ({request.photos.length})</p>
                    <div className="flex gap-2 flex-wrap">
                      {request.photos.slice(0, 3).map((photo, index) => (
                        <div key={index} className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">Photo {index + 1}</span>
                        </div>
                      ))}
                      {request.photos.length > 3 && (
                        <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">+{request.photos.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceList;
