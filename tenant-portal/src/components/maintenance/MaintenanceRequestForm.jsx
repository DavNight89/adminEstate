import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  ArrowLeft,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Camera
} from 'lucide-react';

const MaintenanceRequestForm = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    priority: 'normal',
    location: '',
    title: '',
    description: '',
    accessInstructions: '',
    preferredTime: '',
    photos: []
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = [
    { value: 'plumbing', label: 'Plumbing', icon: '🚰' },
    { value: 'electrical', label: 'Electrical', icon: '⚡' },
    { value: 'hvac', label: 'HVAC/Heating/Cooling', icon: '❄️' },
    { value: 'appliance', label: 'Appliance', icon: '🔌' },
    { value: 'structural', label: 'Structural/Walls', icon: '🏗️' },
    { value: 'doors_windows', label: 'Doors/Windows', icon: '🚪' },
    { value: 'pest', label: 'Pest Control', icon: '🐛' },
    { value: 'other', label: 'Other', icon: '🔧' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800', description: 'Can wait a few days' },
    { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800', description: 'Should be fixed soon' },
    { value: 'high', label: 'High', color: 'bg-yellow-100 text-yellow-800', description: 'Needs attention ASAP' },
    { value: 'urgent', label: 'Urgent/Emergency', color: 'bg-red-100 text-red-800', description: 'Immediate danger or damage' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.photos.length > 5) {
      alert('You can upload a maximum of 5 photos');
      return;
    }

    setUploading(true);

    try {
      // Upload each file to the server
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('photo', file);

        const response = await fetch('http://localhost:5000/api/upload/photo', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const result = await response.json();

        // Return photo info with server path and local preview
        return {
          path: result.data.path,
          filename: result.data.filename,
          originalName: result.data.originalName,
          preview: `http://localhost:5000${result.data.path}` // For preview
        };
      });

      const uploadedPhotos = await Promise.all(uploadPromises);

      setFormData({
        ...formData,
        photos: [...formData.photos, ...uploadedPhotos]
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare data for backend - only send photo paths, not preview URLs
      const requestData = {
        ...formData,
        photos: formData.photos.map(photo => photo.path), // Only send paths
        tenantId: user?.tenant?.id,
        tenantName: user?.tenant?.name || 'Tenant',
        tenantEmail: user?.tenant?.email || '',
        unit: user?.tenant?.unit || 'Unknown',
        property: user?.tenant?.property || 'Unknown Property'
      };

      const response = await fetch('http://localhost:5000/api/tenant/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tenantToken')}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Maintenance request created:', data.data);
        setSuccess(true);
        setTimeout(() => {
          navigate('/maintenance');
        }, 2000);
      } else {
        console.error('Failed to submit:', data.error);
        alert('Failed to submit maintenance request. Please try again.');
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Error submitting maintenance request:', err);
      alert('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your maintenance request has been sent to your property manager.
            You'll receive updates via messages.
          </p>
          <Link
            to="/maintenance"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View My Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">New Maintenance Request</h1>
              <p className="text-sm text-gray-600">
                Unit {user?.tenant?.unit} • {user?.tenant?.property}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    formData.category === cat.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Priority *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p.value })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.priority === p.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{p.label}</span>
                    <span className={`text-xs px-2 py-1 rounded ${p.color}`}>
                      {p.value.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Kitchen, Master Bathroom, Living Room"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Issue Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief description of the issue"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Please describe the issue in detail. Include when it started, what's happening, and any relevant information..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos (Optional, up to 5)
            </label>
            <div className="space-y-3">
              {/* Upload Button */}
              <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors cursor-pointer">
                <div className="text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload photos or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 10MB each
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading || formData.photos.length >= 5}
                />
              </label>

              {/* Photo Previews */}
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Access Instructions */}
          <div>
            <label htmlFor="accessInstructions" className="block text-sm font-medium text-gray-700 mb-2">
              Access Instructions (Optional)
            </label>
            <textarea
              id="accessInstructions"
              name="accessInstructions"
              value={formData.accessInstructions}
              onChange={handleChange}
              rows={3}
              placeholder="Any special instructions for accessing the unit? (e.g., pet at home, alarm code, etc.)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          {/* Preferred Time */}
          <div>
            <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time (Optional)
            </label>
            <select
              id="preferredTime"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">No preference</option>
              <option value="morning">Morning (8 AM - 12 PM)</option>
              <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
              <option value="evening">Evening (5 PM - 8 PM)</option>
              <option value="weekend">Weekend</option>
            </select>
          </div>

          {/* Emergency Notice */}
          {formData.priority === 'urgent' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Emergency Request</p>
                <p>
                  For immediate emergencies (fire, flood, gas leak, etc.), please call the emergency
                  hotline at <strong>(555) 911-HELP</strong> instead of submitting this form.
                </p>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting || !formData.category || !formData.location || !formData.title || !formData.description}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
            <Link
              to="/maintenance"
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default MaintenanceRequestForm;
