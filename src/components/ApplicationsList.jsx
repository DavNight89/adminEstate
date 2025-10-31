// src/components/ApplicationsList.jsx
import React, { useState } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, AlertCircle, UserCheck, FileText, Plus } from 'lucide-react';

export default function ApplicationsList({
  applications = [],
  properties = [],
  onViewApplication,
  onNewApplication,
  onUpdateStatus,
  onDelete
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('submittedDate'); // submittedDate, name, property

  const getStatusBadge = (status) => {
    const badges = {
      submitted: {
        color: 'bg-blue-100 border-blue-200',
        textColor: 'text-blue-900',
        icon: Clock,
        text: 'Submitted'
      },
      screening: {
        color: 'bg-yellow-100 border-yellow-200',
        textColor: 'text-yellow-900',
        icon: AlertCircle,
        text: 'Screening'
      },
      approved: {
        color: 'bg-green-100 border-green-200',
        textColor: 'text-green-900',
        icon: CheckCircle,
        text: 'Approved'
      },
      conditional: {
        color: 'bg-purple-100 border-purple-200',
        textColor: 'text-purple-900',
        icon: UserCheck,
        text: 'Conditional'
      },
      rejected: {
        color: 'bg-red-100 border-red-200',
        textColor: 'text-red-900',
        icon: XCircle,
        text: 'Rejected'
      },
      withdrawn: {
        color: 'bg-gray-100 border-gray-200',
        textColor: 'text-gray-900',
        icon: XCircle,
        text: 'Withdrawn'
      }
    };

    const badge = badges[status] || badges.submitted;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.color} ${badge.textColor}`} style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)'}}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  const filteredApplications = applications
    .filter(app => {
      // Filter by search term
      const matchesSearch =
        app.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.propertyName?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by status
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort applications
      switch (sortBy) {
        case 'submittedDate':
          return new Date(b.submittedDate) - new Date(a.submittedDate);
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'property':
          return (a.propertyName || '').localeCompare(b.propertyName || '');
        default:
          return 0;
      }
    });

  const getApplicationStats = () => {
    return {
      total: applications.length,
      submitted: applications.filter(a => a.status === 'submitted').length,
      screening: applications.filter(a => a.status === 'screening').length,
      approved: applications.filter(a => a.status === 'approved').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    };
  };

  const stats = getApplicationStats();

  const getDaysAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Tenant Applications</h2>
          <button
            onClick={onNewApplication}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Application
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 rounded p-3 text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="bg-blue-50 rounded p-3 text-center">
            <div className="text-2xl font-bold text-blue-800">{stats.submitted}</div>
            <div className="text-xs text-blue-600">Submitted</div>
          </div>
          <div className="bg-yellow-50 rounded p-3 text-center">
            <div className="text-2xl font-bold text-yellow-800">{stats.screening}</div>
            <div className="text-xs text-yellow-600">Screening</div>
          </div>
          <div className="bg-green-50 rounded p-3 text-center">
            <div className="text-2xl font-bold text-green-800">{stats.approved}</div>
            <div className="text-xs text-green-600">Approved</div>
          </div>
          <div className="bg-red-50 rounded p-3 text-center">
            <div className="text-2xl font-bold text-red-800">{stats.rejected}</div>
            <div className="text-xs text-red-600">Rejected</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="screening">Screening</option>
            <option value="approved">Approved</option>
            <option value="conditional">Conditional</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="submittedDate">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="property">Sort by Property</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="overflow-x-auto">
        {filteredApplications.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Move-In Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Income
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApplications.map(app => (
                <tr key={app.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {app.firstName} {app.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{app.email}</div>
                      <div className="text-xs text-gray-400">{app.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{app.propertyName}</div>
                    {app.desiredUnit && (
                      <div className="text-xs text-gray-500">Unit {app.desiredUnit}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(app.desiredMoveInDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${app.monthlyIncome?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">/month</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(app.submittedDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getDaysAgo(app.submittedDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewApplication(app)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {app.status === 'submitted' && onUpdateStatus && (
                        <button
                          onClick={() => onUpdateStatus(app.id, 'screening')}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded hover:bg-yellow-200 transition"
                        >
                          Start Screening
                        </button>
                      )}

                      {app.status === 'screening' && onUpdateStatus && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => onUpdateStatus(app.id, 'approved')}
                            className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 transition"
                            title="Approve"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onUpdateStatus(app.id, 'rejected')}
                            className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200 transition"
                            title="Reject"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {app.status === 'approved' && app.tenantId && (
                        <span className="text-xs text-green-600 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Converted
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Applications will appear here once submitted'}
            </p>
          </div>
        )}
      </div>

      {/* Results count */}
      {filteredApplications.length > 0 && (
        <div className="px-6 py-4 border-t bg-gray-50 text-sm text-gray-600">
          Showing {filteredApplications.length} of {applications.length} applications
        </div>
      )}
    </div>
  );
}
