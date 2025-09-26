import React from 'react';
import { 
  X, MapPin, DollarSign, Users, Edit,
   Clock,
  FileText, Calendar, Building, Lightbulb, TrendingUp, BarChart3
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';




const Modal = ({showModal, 
  modalType, 
  closeModal, 
  handleSubmit, 
  formData,  
  selectedItem,
  handleInputChange,
  properties,
  tenants,
  setActiveTab,
  workOrders,
  openModal
}) => {
  if (!showModal) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className={`bg-white rounded-xl shadow-xl w-full mx-4 overflow-y-auto ${
      modalType === 'viewMonthlyRevenue' || modalType === 'viewOccupancyRate' || modalType === 'viewPropertiesOverview' || modalType === 'viewTotalUnits'
        ? 'max-w-6xl max-h-[95vh]'  // ← Large modals
        : 'max-w-md max-h-[90vh]' 
        ? 'w-full max-w-7xl max-h-[95vh]'  // ← Even larger for detailed modals
        : 'w-full max-w-md max-h-[90vh]'  // ← Standard modals
    }`}>
        
        {/* Header with Modal Title */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {modalType === 'addTenant' ? 'Add New Tenant' :
             modalType === 'editTenant' ? 'Edit Tenant' :
             modalType === 'addProperty' ? 'Add New Property' :
             modalType === 'addWorkOrder' ? 'Create Work Order' :
             modalType === 'editWorkOrder' ? 'Update Work Order' :
             modalType === 'viewWorkOrder' ? 'Work Order Details' :
             modalType === 'updateProperty' ? 'Update Property' :
             modalType === 'addTransaction' ? 'Record Transaction' :
             modalType === 'editTransaction' ? 'Update Transaction' :
             modalType === 'viewProperty' ? selectedItem?.name || 'Property Details' :
             modalType === 'viewPropertiesOverview' ? 'Properties Portfolio Overview' :
             modalType === 'viewTenant' ? 'Tenant Details' :
             modalType === 'viewOccupancyRate' ? 'Occupancy Rate Analysis' :
             modalType === 'viewTotalUnits' ? 'Total Units Overview' : 
             'Modal'}
          </h3>
          <button 
            onClick={closeModal} 
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {modalType === 'viewWorkOrder' && selectedItem && (
  <div className="space-y-6">
    
    {/* Work Order Header */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{selectedItem.issue}</h3>
          <p className="text-gray-600">Work Order #{selectedItem.id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          selectedItem.priority === 'High' ? 'bg-red-100 text-red-800' :
          selectedItem.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {selectedItem.priority} Priority
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Property:</p>
          <p className="font-medium">{selectedItem.property}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Unit:</p>
          <p className="font-medium">{selectedItem.unit}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Tenant:</p>
          <p className="font-medium">{selectedItem.tenant}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Date Submitted:</p>
          <p className="font-medium">{selectedItem.dateSubmitted}</p>
        </div>
      </div>
    </div>

                {/* Status Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Status Information
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Status:</span>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    selectedItem.status === 'Open' ? 'bg-red-100 text-red-800' :
                    selectedItem.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedItem.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Assigned To:</span>
                  <span className="font-medium">
                    {selectedItem.assignedTo || (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                                    </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{selectedItem.category || 'General'}</span>
                </div>
                {selectedItem.estimatedCost > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estimated Cost:</span>
                    <span className="font-medium text-green-600">
                      ${selectedItem.estimatedCost.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Issue Description */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Issue Description
              </h4>
              <p className="text-gray-900 leading-relaxed">{selectedItem.issue}</p>
              
              {selectedItem.description && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="font-medium text-gray-700 mb-2">Additional Notes:</h5>
                  <p className="text-gray-900">{selectedItem.description}</p>
                </div>
                              )}
            </div>

            {/* Timeline */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Timeline
              </h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Work order created</p>
                    <p className="text-xs text-gray-500">{selectedItem.dateSubmitted}</p>
                  </div>
                </div>
                {selectedItem.status !== 'Open' && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium">Status updated to {selectedItem.status}</p>
                      <p className="text-xs text-gray-500">In progress</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
    <div className="flex space-x-2 pt-4">
      <button
        onClick={() => {
          closeModal();
          openModal('editWorkOrder', selectedItem);
        }}
        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
      >
        <Edit className="w-4 h-4 mr-2" />
        Update Work Order
      </button>
      <button
                onClick={closeModal}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                Close
              </button>
            </div>
            </div>
  )}
    

{modalType === 'viewProperty' && selectedItem && (
  <div className="space-y-4">
    {/* Property Header */}
    <div className="text-center mb-6">
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-white">{selectedItem.name}</h2>
      </div>
      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
        {selectedItem.type}
      </span>
    </div>

    {/* Property Details Grid */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-1">Total Units</h4>
        <p className="text-2xl font-bold text-blue-600">{selectedItem.units}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-1">Occupied</h4>
        <p className="text-2xl font-bold text-green-600">{selectedItem.occupied}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-1">Vacant</h4>
        <p className="text-2xl font-bold text-orange-600">{selectedItem.units - selectedItem.occupied}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-1">Occupancy Rate</h4>
        <p className="text-2xl font-bold text-purple-600">
          {Math.round((selectedItem.occupied / selectedItem.units) * 100)}%
        </p>
      </div>
    </div>

    {/* Address */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
        <MapPin className="w-4 h-4 mr-2" />
        Address
      </h4>
      <p className="text-gray-900">{selectedItem.address}</p>
    </div>

    {/* Financial Info */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
        <DollarSign className="w-4 h-4 mr-2" />
        Financial Information
      </h4>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Monthly Revenue:</span>
          <span className="font-semibold">${selectedItem.monthlyRevenue.toLocaleString()}</span>
        </div>
        {selectedItem.purchasePrice && (
          <div className="flex justify-between">
            <span className="text-gray-600">Purchase Price:</span>
            <span className="font-semibold">${selectedItem.purchasePrice.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>

    {/* Tenants in this Property */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
        <Users className="w-4 h-4 mr-2" />
        Current Tenants
      </h4>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {tenants
          .filter(tenant => tenant.property === selectedItem.name)
          .map(tenant => (
            <div key={tenant.id} className="flex items-center justify-between bg-white p-2 rounded">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3">
                  {tenant.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium">{tenant.name}</p>
                  <p className="text-xs text-gray-500">Unit {tenant.unit}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600">
                ${tenant.rent.toLocaleString()}
              </span>
            </div>
          ))}
        {tenants.filter(tenant => tenant.property === selectedItem.name).length === 0 && (
          <p className="text-gray-500 text-sm">No tenants assigned yet</p>
        )}
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex space-x-2 pt-4">
      <button
        onClick={() => {
          closeModal();
          setActiveTab('tenants');
        }}
        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
      >
        <Users className="w-4 h-4 mr-2" />
        Manage Tenants
      </button>
      <button
        onClick={closeModal}
        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
      >
        Close
      </button>
    </div>
  </div>
)}

{modalType === 'viewTenant' && selectedItem && (
  <div className="p-6 space-y-6">
    {/* Tenant Header */}
    <div className="text-center mb-6">
      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">{selectedItem.avatar}</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{selectedItem.name}</h2>
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
        selectedItem.status === 'Current' ? 'bg-green-100 text-green-800' :
        selectedItem.status === 'Late' ? 'bg-red-100 text-red-800' :
        selectedItem.status === 'Notice' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {selectedItem.status}
      </span>
    </div>

    {/* Contact Information */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
        <Users className="w-4 h-4 mr-2" />
        Contact Information
      </h4>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Email:</span>
          <a href={`mailto:${selectedItem.email}`} className="text-blue-600 hover:text-blue-800">
            {selectedItem.email}
          </a>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Phone:</span>
          <a href={`tel:${selectedItem.phone}`} className="text-blue-600 hover:text-blue-800">
            {selectedItem.phone}
          </a>
        </div>
      </div>
    </div>

    {/* Property & Unit Information */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
        <MapPin className="w-4 h-4 mr-2" />
        Property & Unit Details
      </h4>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Property:</span>
          <span className="font-medium">{selectedItem.property}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Unit Number:</span>
          <span className="font-medium">{selectedItem.unit}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Monthly Rent:</span>
          <span className="font-medium text-green-600">
            ${selectedItem.rent?.toLocaleString() || '0'}
          </span>
        </div>
      </div>
    </div>

    {/* Lease Information */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
        <FileText className="w-4 h-4 mr-2" />
        Lease Information
      </h4>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Lease End Date:</span>
          <span className="font-medium">{selectedItem.leaseEnd}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Days Until Lease Ends:</span>
          <span className={`font-medium ${
            new Date(selectedItem.leaseEnd) - new Date() < 30 * 24 * 60 * 60 * 1000 
              ? 'text-red-600' : 'text-gray-900'
          }`}>
            {Math.ceil((new Date(selectedItem.leaseEnd) - new Date()) / (1000 * 60 * 60 * 24))} days
          </span>
        </div>
      </div>
    </div>

    {/* Financial Information */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
        <DollarSign className="w-4 h-4 mr-2" />
        Financial Information
      </h4>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Account Balance:</span>
          <span className={`font-medium ${
            (selectedItem.balance || 0) > 0 ? 'text-red-600' : 
            (selectedItem.balance || 0) < 0 ? 'text-green-600' : 'text-gray-900'
          }`}>
            ${Math.abs(selectedItem.balance || 0).toLocaleString()}
            {(selectedItem.balance || 0) > 0 && ' (Owed)'}
            {(selectedItem.balance || 0) < 0 && ' (Credit)'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Monthly Rent:</span>
          <span className="font-medium">${selectedItem.rent?.toLocaleString() || '0'}</span>
        </div>
      </div>
    </div>

    {/* Recent Activity */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
        <Clock className="w-4 h-4 mr-2" />
        Recent Activity
      </h4>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {/* You can populate this with recent transactions or work orders */}
        <div className="text-sm text-gray-600">
          <p>Last rent payment: {new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
          <p>Account created: {new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
        </div>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex space-x-2 pt-4">
      <button
        onClick={() => {
          closeModal();
          openModal('editTenant', selectedItem);
        }}
        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
      >
        <Edit className="w-4 h-4 mr-2" />
        Edit Tenant
      </button>
      <button
        onClick={closeModal}
        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
      >
        Close
      </button>
    </div>
  </div>
)}

{modalType === 'viewOccupancyRate' && (
  <div className="p-6 space-y-6 max-w-4xl mx-auto">
    {/* Header */}
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-lg -mx-6 -mt-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold mb-2">Occupancy Rate Analysis</h3>
          <p className="text-blue-100">Detailed breakdown of unit occupancy</p>
        </div>
        <div className="text-right">
          {(() => {
            const totalUnits = properties.reduce((acc, prop) => acc + (prop.units || 0), 0);
            const occupiedUnits = properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0);
            const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
            return (
              <>
                <div className="text-4xl font-bold">{occupancyRate.toFixed(1)}%</div>
                <div className="text-blue-100 text-sm">Current Rate</div>
              </>
            );
          })()}
        </div>
      </div>
    </div>

    {/* Quick Stats */}
    {(() => {
      const totalUnits = properties.reduce((acc, prop) => acc + (prop.units || 0), 0);
      const occupiedUnits = properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0);
      const vacantUnits = totalUnits - occupiedUnits;
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <Building className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{totalUnits}</div>
            <div className="text-sm text-blue-800">Total Units</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{occupiedUnits}</div>
            <div className="text-sm text-green-800">Occupied</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{vacantUnits}</div>
            <div className="text-sm text-orange-800">Vacant</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{occupancyRate.toFixed(1)}%</div>
            <div className="text-sm text-purple-800">Occupancy Rate</div>
          </div>
        </div>
      );
    })()}

    {/* Visual Progress Bar */}
    {(() => {
      const totalUnits = properties.reduce((acc, prop) => acc + (prop.units || 0), 0);
      const occupiedUnits = properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0);
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      return (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-gray-900">Visual Occupancy Rate</h4>
            <span className="text-sm text-gray-600">All Properties</span>
          </div>
          
          <div className="relative">
            <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-1000 ease-out relative"
                style={{ width: `${occupancyRate}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-800 bg-white/80 px-2 py-1 rounded">
                {occupancyRate.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      );
    })()}

    {/* Property Breakdown */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
        <Building className="w-4 h-4 mr-2" />
        Property Breakdown
      </h4>
      <div className="space-y-3">
        {properties.map(property => {
          const occupancyRate = property.units > 0 ? (property.occupied / property.units) * 100 : 0;
          return (
            <div key={property.id} className="bg-white p-3 rounded border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{property.name}</span>
                <span className="text-sm font-bold text-blue-600">{occupancyRate.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-500"
                  style={{ width: `${occupancyRate}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>{property.occupied}/{property.units} units</span>
                <span>{property.units - property.occupied} vacant</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Calculation Breakdown */}
    {(() => {
      const totalUnits = properties.reduce((acc, prop) => acc + (prop.units || 0), 0);
      const occupiedUnits = properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0);
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
            <Edit className="w-4 h-4 mr-2" />
            Calculation Details
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-white rounded-lg">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div className="flex-1">
                <h5 className="font-medium text-gray-900 mb-1">Count Total Units</h5>
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded border">
                    {properties.map(p => `${p.name}: ${p.units || 0}`).join(' + ')}
                  </span>
                </div>
                <div className="text-sm font-semibold text-blue-600">= {totalUnits} total units</div>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-white rounded-lg">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div className="flex-1">
                <h5 className="font-medium text-gray-900 mb-1">Count Occupied Units</h5>
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded border">
                    {properties.map(p => `${p.name}: ${p.occupied || 0}`).join(' + ')}
                  </span>
                </div>
                <div className="text-sm font-semibold text-blue-600">= {occupiedUnits} occupied units</div>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-white rounded-lg">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div className="flex-1">
                <h5 className="font-medium text-gray-900 mb-1">Calculate Occupancy Rate</h5>
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded border">
                    ({occupiedUnits} ÷ {totalUnits}) × 100
                  </span>
                </div>
                <div className="text-sm font-semibold text-blue-600">= {occupancyRate.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h5 className="font-semibold text-blue-900 mb-2">Occupancy Rate Formula:</h5>
            <div className="text-lg font-mono text-blue-800 bg-white p-3 rounded border">
              Occupancy Rate = (Occupied Units ÷ Total Units) × 100
            </div>
          </div>
        </div>
      );
    })()}

    {/* Performance Insight */}
    {(() => {
      const totalUnits = properties.reduce((acc, prop) => acc + (prop.units || 0), 0);
      const occupiedUnits = properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0);
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      return (
        <div className="p-4 rounded-lg border-l-4 border-l-blue-500 bg-blue-50">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-semibold text-blue-900">Performance Insight:</span>
          </div>
          <p className="text-blue-800 mt-1">
            {occupancyRate >= 95 ? (
              "🎉 Excellent! Your occupancy rate is outstanding."
            ) : occupancyRate >= 85 ? (
              "👍 Good occupancy rate. Consider strategies to reach 95%+."
            ) : occupancyRate >= 70 ? (
              "⚠️ Fair occupancy. Focus on filling vacant units."
            ) : (
              "🚨 Low occupancy rate. Immediate attention needed to improve."
            )}
          </p>
        </div>
      );
    })()}

    {/* Action Buttons */}
    <div className="flex space-x-2 pt-4 border-t border-gray-200">
      <button
        onClick={closeModal}
        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
      >
        Close
      </button>
    </div>
  </div>
)}

// Add this enhanced revenue analysis to your Modal.js

{modalType === 'viewAdvancedRevenue' && (
  <div className="p-6 space-y-6 max-w-6xl mx-auto">
    {/* Executive Summary Header */}
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white rounded-lg -mx-6 -mt-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold">${totalRevenue.toLocaleString()}</div>
          <div className="text-green-100 text-sm">Monthly Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">${(totalRevenue * 12).toLocaleString()}</div>
          <div className="text-green-100 text-sm">Annualized</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">{occupancyRate.toFixed(1)}%</div>
          <div className="text-green-100 text-sm">Occupancy Rate</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">${avgRevenuePerUnit.toFixed(0)}</div>
          <div className="text-green-100 text-sm">Revenue/Unit</div>
        </div>
      </div>
    </div>

    {/* Revenue Trend Chart */}
    <div className="bg-white p-6 rounded-lg border">
      <h4 className="text-lg font-semibold mb-4">Revenue Trends (12 Months)</h4>
      <div className="h-64">
        {/* Add chart component here - you can use recharts or similar */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueHistoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
            <Line 
              type="monotone" 
              dataKey="actualRevenue" 
              stroke="#10b981" 
              strokeWidth={3}
              name="Actual Revenue"
            />
            <Line 
              type="monotone" 
              dataKey="projectedRevenue" 
              stroke="#6b7280" 
              strokeDasharray="5 5"
              name="Projected Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Revenue Composition Breakdown */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Sources */}
      <div className="bg-white p-6 rounded-lg border">
        <h4 className="text-lg font-semibold mb-4">Revenue Sources</h4>
        <div className="space-y-3">
          {(() => {
            const revenueStreams = [
              { name: 'Base Rent', amount: totalRevenue * 0.85, color: 'bg-blue-500' },
              { name: 'Parking Fees', amount: totalRevenue * 0.08, color: 'bg-green-500' },
              { name: 'Pet Fees', amount: totalRevenue * 0.04, color: 'bg-yellow-500' },
              { name: 'Late Fees', amount: totalRevenue * 0.02, color: 'bg-red-500' },
              { name: 'Other Fees', amount: totalRevenue * 0.01, color: 'bg-purple-500' }
            ];
            
            return revenueStreams.map(stream => {
              const percentage = (stream.amount / totalRevenue) * 100;
              return (
                <div key={stream.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${stream.color} rounded-full mr-3`}></div>
                    <span className="text-sm text-gray-700">{stream.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">${stream.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg border">
        <h4 className="text-lg font-semibold mb-4">Performance Metrics</h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Revenue per Sq Ft</span>
            <span className="font-medium">${(totalRevenue / 50000).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Collection Rate</span>
            <span className="font-medium text-green-600">96.8%</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Renewal Rate</span>
            <span className="font-medium text-blue-600">84.2%</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Price Growth (YoY)</span>
            <span className="font-medium text-purple-600">+5.2%</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Revenue Efficiency</span>
            <span className="font-medium">{((totalRevenue / potentialRevenue) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>

    {/* Property-by-Property Analysis */}
    <div className="bg-white p-6 rounded-lg border">
      <h4 className="text-lg font-semibold mb-4">Property Performance Analysis</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occupancy</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Revenue</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue/Unit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {properties.map(property => {
              const propertyOccupancy = property.units > 0 ? (property.occupied / property.units) * 100 : 0;
              const revenuePerUnit = property.units > 0 ? property.monthlyRevenue / property.units : 0;
              const performance = propertyOccupancy >= 95 ? 'Excellent' : 
                                 propertyOccupancy >= 85 ? 'Good' : 
                                 propertyOccupancy >= 75 ? 'Fair' : 'Poor';
              const performanceColor = performance === 'Excellent' ? 'text-green-600' :
                                     performance === 'Good' ? 'text-blue-600' :
                                     performance === 'Fair' ? 'text-yellow-600' : 'text-red-600';

              return (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{property.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{property.units}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{propertyOccupancy.toFixed(1)}%</td>
                  <td className="px-4 py-4 text-sm font-medium text-green-600">
                    ${property.monthlyRevenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">${revenuePerUnit.toFixed(0)}</td>
                  <td className={`px-4 py-4 text-sm font-medium ${performanceColor}`}>
                    {performance}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

    {/* Revenue Optimization Opportunities */}
    <div className="bg-white p-6 rounded-lg border">
      <h4 className="text-lg font-semibold mb-4">Revenue Optimization Opportunities</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(() => {
          const vacantUnits = properties.reduce((acc, prop) => acc + (prop.units - prop.occupied), 0);
          const potentialRentIncrease = totalRevenue * 0.03; // 3% increase potential
          const additionalFeeRevenue = totalRevenue * 0.05; // 5% from new fees

          return (
            <>
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  ${(vacantUnits * 1500).toLocaleString()}/mo
                </div>
                <div className="text-sm text-orange-800">Fill Vacant Units</div>
                <div className="text-xs text-orange-600 mt-1">
                  {vacantUnits} units @ $1,500 avg rent
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  ${potentialRentIncrease.toLocaleString()}/mo
                </div>
                <div className="text-sm text-blue-800">Rent Optimization</div>
                <div className="text-xs text-blue-600 mt-1">
                  3% strategic increase on renewals
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  ${additionalFeeRevenue.toLocaleString()}/mo
                </div>
                <div className="text-sm text-green-800">Additional Services</div>
                <div className="text-xs text-green-600 mt-1">
                  Parking, storage, amenity fees
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>

    {/* Forecasting & Projections */}
    <div className="bg-white p-6 rounded-lg border">
      <h4 className="text-lg font-semibold mb-4">Revenue Projections</h4>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(() => {
          const currentMonthly = totalRevenue;
          const projected3Month = currentMonthly * 3 * 1.02;
          const projected6Month = currentMonthly * 6 * 1.04;
          const projectedAnnual = currentMonthly * 12 * 1.05;

          return (
            <>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">
                  ${projected3Month.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">3-Month Projection</div>
                <div className="text-xs text-green-600">+2% growth</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">
                  ${projected6Month.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">6-Month Projection</div>
                <div className="text-xs text-green-600">+4% growth</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">
                  ${projectedAnnual.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Annual Projection</div>
                <div className="text-xs text-green-600">+5% growth</div>
              </div>

              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  ${(projectedAnnual - currentMonthly * 12).toLocaleString()}
                </div>
                <div className="text-sm text-green-800">Potential Growth</div>
                <div className="text-xs text-green-600">vs current run rate</div>
              </div>
            </>
          );
        })()}
      </div>
    </div>

    {/* Action Items */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-semibold text-blue-900 mb-3">Recommended Actions</h4>
      <div className="space-y-2 text-sm">
        <div className="flex items-start">
          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-blue-800">Focus on filling {vacantUnits} vacant units to capture ${(vacantUnits * 1500).toLocaleString()}/month</span>
        </div>
        <div className="flex items-start">
          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-blue-800">Review rent prices for renewal opportunities</span>
        </div>
        <div className="flex items-start">
          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span className="text-blue-800">Explore additional revenue streams (parking, storage fees)</span>
        </div>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex space-x-2 pt-4 border-t border-gray-200">
      <button
        onClick={() => {
          // Export to CSV/PDF functionality
          console.log('Exporting revenue report...');
        }}
        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors"
      >
        <Download className="w-4 h-4 mr-2" />
        Export Report
      </button>
      <button
        onClick={closeModal}
        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
      >
        Close
      </button>
    </div>
  </div>
)}

{modalType === 'viewMonthlyRevenue' && (
  <div className="p-6 space-y-6 max-w-4xl mx-auto">
    {/* Header */}
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white rounded-lg -mx-6 -mt-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold mb-2">Monthly Revenue Analysis</h3>
          <p className="text-green-100">Detailed breakdown of income sources</p>
        </div>
        <div className="text-right">
          {(() => {
            const totalRevenue = properties.reduce((acc, prop) => acc + (prop.monthlyRevenue || 0), 0);
            return (
              <>
                <div className="text-4xl font-bold">${totalRevenue.toLocaleString()}</div>
                <div className="text-green-100 text-sm">Total Monthly Revenue</div>
              </>
            );
          })()}
        </div>
      </div>
    </div>

    {/* Revenue Summary Cards */}
    {(() => {
      const totalRevenue = properties.reduce((acc, prop) => acc + (prop.monthlyRevenue || 0), 0);
      const activeTenantsRevenue = tenants
        .filter(t => t.status === 'Current')
        .reduce((acc, t) => acc + (parseFloat(t.rent) || 0), 0);
      const potentialRevenue = properties.reduce((acc, prop) => acc + (prop.units * 1500), 0); // Assuming $1500 avg rent
      const occupancyRate = properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0) / 
                           properties.reduce((acc, prop) => acc + (prop.units || 0), 0) * 100 || 0;
      const revenueEfficiency = potentialRevenue > 0 ? (totalRevenue / potentialRevenue) * 100 : 0;

      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-green-800">Current Revenue</div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">${activeTenantsRevenue.toLocaleString()}</div>
            <div className="text-sm text-blue-800">Active Tenants</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">${potentialRevenue.toLocaleString()}</div>
            <div className="text-sm text-purple-800">Potential Revenue</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{revenueEfficiency.toFixed(1)}%</div>
            <div className="text-sm text-orange-800">Revenue Efficiency</div>
          </div>
        </div>
      );
    })()}

    {/* Revenue by Property */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
        <Building className="w-4 h-4 mr-2" />
        Revenue by Property
      </h4>
      <div className="space-y-3">
        {properties.map(property => {
          const propertyTenants = tenants.filter(t => t.property === property.name && t.status === 'Current');
          const occupancyRate = property.units > 0 ? (property.occupied / property.units) * 100 : 0;
          const revenuePerUnit = property.units > 0 ? property.monthlyRevenue / property.units : 0;
          const potentialRevenue = property.units * 1500; // Assuming $1500 avg
          const revenueGap = potentialRevenue - property.monthlyRevenue;
          
          return (
            <div key={property.id} className="bg-white p-4 rounded border">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h5 className="font-medium text-gray-900">{property.name}</h5>
                  <p className="text-sm text-gray-600">{property.address}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    ${property.monthlyRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    ${revenuePerUnit.toFixed(0)}/unit
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-600">Units</div>
                  <div className="font-medium">{property.occupied}/{property.units}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Occupancy</div>
                  <div className="font-medium">{occupancyRate.toFixed(1)}%</div>
                </div>
              </div>

{/* Revenue Progress Bar - Responsive Version */}
<div className="mb-3">
  <div className="flex justify-between items-center mb-1">
    <span className="text-xs text-gray-600">Revenue Performance</span>
    <div className="flex items-center space-x-2">
      <span className="text-xs font-medium text-blue-600">
        {((property.monthlyRevenue / potentialRevenue) * 100).toFixed(1)}%
      </span>
      <span className="text-xs text-gray-500">of potential</span>
    </div>
  </div>
  
  <div className="relative">
    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div 
        className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500 flex items-center justify-center relative"
        style={{ width: `${Math.min((property.monthlyRevenue / potentialRevenue) * 100, 100)}%` }}
      >
        {/* Show percentage inside bar only if width is sufficient */}
        {((property.monthlyRevenue / potentialRevenue) * 100) > 25 && (
          <span className="text-xs font-bold text-white px-1 truncate">
            {((property.monthlyRevenue / potentialRevenue) * 100).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  </div>
  
  {revenueGap > 0 && (
    <div className="text-xs text-orange-600 mt-1 flex items-center">
      <span className="w-2 h-2 bg-orange-400 rounded-full mr-1 flex-shrink-0"></span>
      <span className="truncate">
        ${revenueGap.toLocaleString()} potential revenue gap
      </span>
    </div>
  )}
</div>

              {/* Tenant Details */}
              <div className="border-t border-gray-200 pt-3">
                <div className="text-xs text-gray-600 mb-2">Active Tenants:</div>
                <div className="space-y-1">
                  {propertyTenants.length > 0 ? (
                    propertyTenants.map(tenant => (
                      <div key={tenant.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{tenant.name} - {tenant.unit}</span>
                        <span className="font-medium text-green-600">${tenant.rent.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">No active tenants</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Revenue Analytics */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Revenue Breakdown */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
          <BarChart3 className="w-4 h-4 mr-2" />
          Revenue Breakdown
        </h4>
        {(() => {
          const totalRevenue = properties.reduce((acc, prop) => acc + (prop.monthlyRevenue || 0), 0);
          
          return (
            <div className="space-y-3">
              {properties.map(property => {
                const percentage = totalRevenue > 0 ? (property.monthlyRevenue / totalRevenue) * 100 : 0;
                return (
                  <div key={property.id} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700 truncate">{property.name}</span>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium">{percentage.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">${property.monthlyRevenue.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Revenue Insights */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
          <Lightbulb className="w-4 h-4 mr-2" />
          Revenue Insights
        </h4>
        {(() => {
          const totalRevenue = properties.reduce((acc, prop) => acc + (prop.monthlyRevenue || 0), 0);
          const topPerformer = properties.reduce((prev, current) => 
            (prev.monthlyRevenue > current.monthlyRevenue) ? prev : current
          );
          const averageRevenue = properties.length > 0 ? totalRevenue / properties.length : 0;
          const vacantUnits = properties.reduce((acc, prop) => acc + (prop.units - prop.occupied), 0);
          
          return (
            <div className="space-y-4">
              <div className="p-3 bg-white rounded border-l-4 border-green-500">
                <div className="text-sm font-medium text-gray-900">Top Performer</div>
                <div className="text-sm text-gray-600">
                  {topPerformer?.name} generates ${topPerformer?.monthlyRevenue?.toLocaleString()}/month
                </div>
              </div>
              
              <div className="p-3 bg-white rounded border-l-4 border-blue-500">
                <div className="text-sm font-medium text-gray-900">Average Revenue</div>
                <div className="text-sm text-gray-600">
                  ${averageRevenue.toLocaleString()} per property
                </div>
              </div>
              
              {vacantUnits > 0 && (
                <div className="p-3 bg-white rounded border-l-4 border-orange-500">
                  <div className="text-sm font-medium text-gray-900">Growth Opportunity</div>
                  <div className="text-sm text-gray-600">
                    {vacantUnits} vacant units could generate up to ${(vacantUnits * 1500).toLocaleString()}/month
                  </div>
                </div>
              )}
              
              <div className="p-3 bg-white rounded border-l-4 border-purple-500">
                <div className="text-sm font-medium text-gray-900">Portfolio Strength</div>
                <div className="text-sm text-gray-600">
                  {properties.length} properties across {properties.reduce((acc, prop) => acc + prop.units, 0)} total units
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>

    {/* Monthly Trends */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
        <TrendingUp className="w-4 h-4 mr-2" />
        Revenue Trends & Projections
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(() => {
          const totalRevenue = properties.reduce((acc, prop) => acc + (prop.monthlyRevenue || 0), 0);
          const annualRevenue = totalRevenue * 12;
          const quarterlyRevenue = totalRevenue * 3;
          
          return (
            <>
              <div className="bg-white p-4 rounded border text-center">
                <div className="text-2xl font-bold text-green-600">${quarterlyRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Quarterly Projection</div>
                <div className="text-xs text-gray-500 mt-1">Based on current rates</div>
              </div>
              
              <div className="bg-white p-4 rounded border text-center">
                <div className="text-2xl font-bold text-blue-600">${annualRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Annual Projection</div>
                <div className="text-xs text-gray-500 mt-1">12-month forecast</div>
              </div>
              
              <div className="bg-white p-4 rounded border text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {properties.length > 0 ? (totalRevenue / properties.length).toFixed(0) : 0}
                </div>
                <div className="text-sm text-gray-600">Avg Revenue/Property</div>
                <div className="text-xs text-gray-500 mt-1">Monthly average</div>
              </div>
            </>
          );
        })()}
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex space-x-2 pt-4 border-t border-gray-200">
      <button
        onClick={() => {
          closeModal();
          setActiveTab('financial');
        }}
        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors"
      >
        <DollarSign className="w-4 h-4 mr-2" />
        Manage Finances
      </button>
      <button
        onClick={closeModal}
        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
      >
        Close
      </button>
    </div>
  </div>
)}

{modalType === 'viewPropertiesOverview' && (
  <div className="p-6 space-y-6 max-w-5xl mx-auto">
    {/* Header */}
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-lg -mx-6 -mt-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold mb-2">Properties Portfolio Overview</h3>
          <p className="text-blue-100">Complete breakdown of your property portfolio</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold">{properties.length}</div>
          <div className="text-blue-100 text-sm">Total Properties</div>
        </div>
      </div>
    </div>

    {/* Portfolio Summary Cards */}
    {(() => {
      const totalUnits = properties.reduce((acc, prop) => acc + (prop.units || 0), 0);
      const occupiedUnits = properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0);
      const vacantUnits = totalUnits - occupiedUnits;
      const totalValue = properties.reduce((acc, prop) => acc + (prop.purchasePrice || 0), 0);
      const totalRevenue = properties.reduce((acc, prop) => acc + (prop.monthlyRevenue || 0), 0);
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <Building className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{totalUnits}</div>
            <div className="text-sm text-blue-800">Total Units</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{occupiedUnits}</div>
            <div className="text-sm text-green-800">Occupied</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{vacantUnits}</div>
            <div className="text-sm text-orange-800">Vacant</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{occupancyRate.toFixed(1)}%</div>
            <div className="text-sm text-purple-800">Occupancy Rate</div>
          </div>
        </div>
      );
    })()}

    {/* Portfolio Value Summary */}
    {(() => {
      const totalValue = properties.reduce((acc, prop) => acc + (prop.purchasePrice || 0), 0);
      const totalRevenue = properties.reduce((acc, prop) => acc + (prop.monthlyRevenue || 0), 0);
      const annualRevenue = totalRevenue * 12;
      const avgValuePerProperty = properties.length > 0 ? totalValue / properties.length : 0;

      return (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Portfolio Financial Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded border text-center">
              <div className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Portfolio Value</div>
            </div>
            <div className="bg-white p-4 rounded border text-center">
              <div className="text-2xl font-bold text-blue-600">${totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
            </div>
            <div className="bg-white p-4 rounded border text-center">
              <div className="text-2xl font-bold text-purple-600">${annualRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Annual Revenue</div>
            </div>
            <div className="bg-white p-4 rounded border text-center">
              <div className="text-2xl font-bold text-orange-600">${avgValuePerProperty.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Avg Property Value</div>
            </div>
          </div>
        </div>
      );
    })()}

    {/* Individual Property Details */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
        <Building className="w-4 h-4 mr-2" />
        Property Details
      </h4>
      <div className="space-y-4">
        {properties.map(property => {
          const occupancyRate = property.units > 0 ? (property.occupied / property.units) * 100 : 0;
          const revenuePerUnit = property.units > 0 ? property.monthlyRevenue / property.units : 0;
          const propertyTenants = tenants.filter(t => t.property === property.name && t.status === 'Current');
          
          return (
            <div key={property.id} className="bg-white p-4 rounded border hover:shadow-md transition-shadow">
              {/* Property Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h5 className="text-lg font-semibold text-gray-900">{property.name}</h5>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {property.address}
                  </p>
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mt-2">
                    {property.type}
                  </span>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => {
                      closeModal();
                      openModal('viewProperty', property);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details →
                  </button>
                </div>
              </div>

              {/* Property Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{property.units}</div>
                  <div className="text-xs text-gray-600">Total Units</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{property.occupied}</div>
                  <div className="text-xs text-gray-600">Occupied</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{property.units - property.occupied}</div>
                  <div className="text-xs text-gray-600">Vacant</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{occupancyRate.toFixed(0)}%</div>
                  <div className="text-xs text-gray-600">Occupancy</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">${property.monthlyRevenue.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Monthly Revenue</div>
                </div>
              </div>

              {/* Occupancy Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Occupancy Rate</span>
                  <span>{occupancyRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${occupancyRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded">
                {property.purchasePrice > 0 && (
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">${property.purchasePrice.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Purchase Price</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-sm font-medium text-green-600">${revenuePerUnit.toFixed(0)}</div>
                  <div className="text-xs text-gray-600">Revenue/Unit</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-blue-600">${(property.monthlyRevenue * 12).toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Annual Revenue</div>
                </div>
              </div>

              {/* Current Tenants Preview */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Current Tenants</span>
                  <span className="text-xs text-gray-500">{propertyTenants.length} active</span>
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {propertyTenants.length > 0 ? (
                    propertyTenants.slice(0, 3).map(tenant => (
                      <div key={tenant.id} className="flex justify-between text-sm">
                        <span className="text-gray-700 truncate">{tenant.name} - Unit {tenant.unit}</span>
                        <span className="font-medium text-green-600">${tenant.rent.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">No active tenants</div>
                  )}
                  {propertyTenants.length > 3 && (
                    <div className="text-xs text-blue-600">
                      +{propertyTenants.length - 3} more tenants
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    closeModal();
                    openModal('viewProperty', property);
                  }}
                  className="flex-1 text-blue-600 hover:bg-blue-50 py-1 px-3 rounded text-sm transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    closeModal();
                    openModal('updateProperty', property);
                  }}
                  className="flex-1 text-green-600 hover:bg-green-50 py-1 px-3 rounded text-sm transition-colors"
                >
                  Edit Property
                </button>
                <button
                  onClick={() => {
                    closeModal();
                    setActiveTab('tenants');
                  }}
                  className="flex-1 text-purple-600 hover:bg-purple-50 py-1 px-3 rounded text-sm transition-colors"
                >
                  Manage Tenants
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Portfolio Insights */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Performance Insights */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Performance Insights
        </h4>
        {(() => {
          const bestPerformer = properties.reduce((prev, current) => 
            (prev.monthlyRevenue > current.monthlyRevenue) ? prev : current
          );
          const highestOccupancy = properties.reduce((prev, current) => {
            const prevRate = prev.units > 0 ? (prev.occupied / prev.units) * 100 : 0;
            const currentRate = current.units > 0 ? (current.occupied / current.units) * 100 : 0;
            return prevRate > currentRate ? prev : current;
          });
          const totalVacant = properties.reduce((acc, prop) => acc + (prop.units - prop.occupied), 0);

          return (
            <div className="space-y-4">
              <div className="p-3 bg-white rounded border-l-4 border-green-500">
                <div className="text-sm font-medium text-gray-900">Top Revenue Generator</div>
                <div className="text-sm text-gray-600">
                  {bestPerformer?.name} - ${bestPerformer?.monthlyRevenue?.toLocaleString()}/month
                </div>
              </div>
              
              <div className="p-3 bg-white rounded border-l-4 border-blue-500">
                <div className="text-sm font-medium text-gray-900">Best Occupancy Rate</div>
                <div className="text-sm text-gray-600">
                  {highestOccupancy?.name} - {((highestOccupancy?.occupied / highestOccupancy?.units) * 100).toFixed(1)}%
                </div>
              </div>
              
              {totalVacant > 0 && (
                <div className="p-3 bg-white rounded border-l-4 border-orange-500">
                  <div className="text-sm font-medium text-gray-900">Vacancy Alert</div>
                  <div className="text-sm text-gray-600">
                    {totalVacant} vacant units across portfolio
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Property Types Distribution */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
          <BarChart3 className="w-4 h-4 mr-2" />
          Property Types
        </h4>
        {(() => {
          const typeDistribution = properties.reduce((acc, prop) => {
            const type = prop.type || 'Unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {});

          return (
            <div className="space-y-3">
              {Object.entries(typeDistribution).map(([type, count]) => {
                const percentage = (count / properties.length) * 100;
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">{type}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{count} properties</div>
                      <div className="text-xs text-gray-500">{percentage.toFixed(0)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex space-x-2 pt-4 border-t border-gray-200">
      <button
        onClick={() => {
          closeModal();
          openModal('addProperty');
        }}
        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
      >
        <Building className="w-4 h-4 mr-2" />
        Add New Property
      </button>
      <button
        onClick={() => {
          closeModal();
          setActiveTab('properties');
        }}
        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors"
      >
        <Edit className="w-4 h-4 mr-2" />
        Manage Properties
      </button>
      <button
        onClick={closeModal}
        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
      >
        Close
      </button>
    </div>
  </div>
)}

{modalType === 'viewTotalUnits' && (
  <div className="p-6 space-y-6 max-w-5xl mx-auto">
    {/* Header */}
    <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white rounded-lg -mx-6 -mt-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold mb-2">Total Units Overview</h3>
          <p className="text-green-100">Complete breakdown of all units across your portfolio</p>
        </div>
        <div className="text-right">
          {(() => {
            const totalUnits = properties.reduce((acc, prop) => acc + (prop.units || 0), 0);
            return (
              <>
                <div className="text-4xl font-bold">{totalUnits}</div>
                <div className="text-green-100 text-sm">Total Units</div>
              </>
            );
          })()}
        </div>
      </div>
    </div>

    {/* Units Summary Cards */}
    {(() => {
      const totalUnits = properties.reduce((acc, prop) => acc + (prop.units || 0), 0);
      const occupiedUnits = properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0);
      const vacantUnits = totalUnits - occupiedUnits;
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <Building className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{totalUnits}</div>
            <div className="text-sm text-blue-800">Total Units</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{occupiedUnits}</div>
            <div className="text-sm text-green-800">Occupied</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{vacantUnits}</div>
            <div className="text-sm text-orange-800">Vacant</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{occupancyRate.toFixed(1)}%</div>
            <div className="text-sm text-purple-800">Occupancy Rate</div>
          </div>
        </div>
      );
    })()}

    {/* Units Distribution by Property */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
        <Building className="w-4 h-4 mr-2" />
        Units Distribution by Property
      </h4>
      <div className="space-y-4">
        {properties.map(property => {
          const occupancyRate = property.units > 0 ? (property.occupied / property.units) * 100 : 0;
          const vacantCount = property.units - property.occupied;
          
          return (
            <div key={property.id} className="bg-white p-4 rounded border hover:shadow-md transition-shadow">
              {/* Property Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h5 className="text-lg font-semibold text-gray-900">{property.name}</h5>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {property.address}
                  </p>
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mt-2">
                    {property.type}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{property.units}</div>
                  <div className="text-sm text-gray-500">Total Units</div>
                </div>
              </div>

              {/* Units Breakdown */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-600">{property.occupied}</div>
                  <div className="text-xs text-green-800">Occupied</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded">
                  <div className="text-lg font-bold text-orange-600">{vacantCount}</div>
                  <div className="text-xs text-orange-800">Vacant</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <div className="text-lg font-bold text-purple-600">{occupancyRate.toFixed(0)}%</div>
                  <div className="text-xs text-purple-800">Occupancy</div>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Unit Occupancy</span>
                  <span>{property.occupied}/{property.units} units filled</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${occupancyRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Unit Details */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Current Tenants</span>
                  <span className="text-xs text-gray-500">{property.occupied} units filled</span>
                </div>
                
                {/* Show tenant list if there are tenants */}
                {(() => {
                  const propertyTenants = tenants.filter(t => t.property === property.name && t.status === 'Current');
                  return (
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {propertyTenants.length > 0 ? (
                        propertyTenants.slice(0, 4).map(tenant => (
                          <div key={tenant.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                            <span className="text-gray-700">Unit {tenant.unit} - {tenant.name}</span>
                            <span className="font-medium text-green-600">${tenant.rent.toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 italic p-2">No active tenants</div>
                      )}
                      {propertyTenants.length > 4 && (
                        <div className="text-xs text-blue-600 p-1">
                          +{propertyTenants.length - 4} more tenants...
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    closeModal();
                    openModal('viewProperty', property);
                  }}
                  className="flex-1 text-blue-600 hover:bg-blue-50 py-1 px-3 rounded text-sm transition-colors"
                >
                  View Property
                </button>
                <button
                  onClick={() => {
                    closeModal();
                    setActiveTab('tenants');
                  }}
                  className="flex-1 text-green-600 hover:bg-green-50 py-1 px-3 rounded text-sm transition-colors"
                >
                  Manage Tenants
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Units Analytics */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Unit Performance */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
          <BarChart3 className="w-4 h-4 mr-2" />
          Unit Performance Metrics
        </h4>
        {(() => {
          const totalUnits = properties.reduce((acc, prop) => acc + (prop.units || 0), 0);
          const occupiedUnits = properties.reduce((acc, prop) => acc + (prop.occupied || 0), 0);
          const avgUnitsPerProperty = properties.length > 0 ? totalUnits / properties.length : 0;
          const bestOccupancyProperty = properties.reduce((prev, current) => {
            const prevRate = prev.units > 0 ? (prev.occupied / prev.units) * 100 : 0;
            const currentRate = current.units > 0 ? (current.occupied / current.units) * 100 : 0;
            return prevRate > currentRate ? prev : current;
          });

          return (
            <div className="space-y-4">
              <div className="p-3 bg-white rounded border-l-4 border-blue-500">
                <div className="text-sm font-medium text-gray-900">Portfolio Size</div>
                <div className="text-sm text-gray-600">
                  {totalUnits} total units across {properties.length} properties
                </div>
              </div>
              
              <div className="p-3 bg-white rounded border-l-4 border-green-500">
                <div className="text-sm font-medium text-gray-900">Best Performing Property</div>
                <div className="text-sm text-gray-600">
                  {bestOccupancyProperty?.name} - {((bestOccupancyProperty?.occupied / bestOccupancyProperty?.units) * 100).toFixed(1)}% occupied
                </div>
              </div>
              
              <div className="p-3 bg-white rounded border-l-4 border-purple-500">
                <div className="text-sm font-medium text-gray-900">Average Units per Property</div>
                <div className="text-sm text-gray-600">
                  {avgUnitsPerProperty.toFixed(1)} units per property
                </div>
              </div>
              
              <div className="p-3 bg-white rounded border-l-4 border-orange-500">
                <div className="text-sm font-medium text-gray-900">Portfolio Utilization</div>
                <div className="text-sm text-gray-600">
                  {occupiedUnits} of {totalUnits} units generating income
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Vacancy Analysis */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Vacancy Analysis
        </h4>
        {(() => {
          const totalUnits = properties.reduce((acc, prop) => acc + (prop.units || 0), 0);
          const vacantUnits = properties.reduce((acc, prop) => acc + (prop.units - prop.occupied), 0);
          const propertiesWithVacancies = properties.filter(prop => prop.units > prop.occupied);
          
          return (
            <div className="space-y-4">
              <div className="p-3 bg-white rounded">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{vacantUnits}</div>
                  <div className="text-sm text-gray-600">Vacant Units</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {((vacantUnits / totalUnits) * 100).toFixed(1)}% of total portfolio
                  </div>
                </div>
              </div>

              {propertiesWithVacancies.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Properties with Vacancies:</div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {propertiesWithVacancies.map(property => {
                      const vacantCount = property.units - property.occupied;
                      return (
                        <div key={property.id} className="flex justify-between text-sm bg-white p-2 rounded">
                          <span className="text-gray-700">{property.name}</span>
                          <span className="font-medium text-orange-600">
                            {vacantCount} vacant
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {vacantUnits > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <div className="text-sm font-medium text-orange-800">Revenue Opportunity</div>
                  <div className="text-sm text-orange-700">
                    Filling vacant units could add up to ${(vacantUnits * 1500).toLocaleString()}/month
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>

    {/* Unit Type Distribution */}
    {(() => {
      const unitsByType = properties.reduce((acc, prop) => {
        const type = prop.type || 'Unknown';
        acc[type] = (acc[type] || 0) + prop.units;
        return acc;
      }, {});

      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
            <Building className="w-4 h-4 mr-2" />
            Units by Property Type
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(unitsByType).map(([type, count]) => {
              const totalUnits = properties.reduce((acc, prop) => acc + (prop.units || 0), 0);
              const percentage = totalUnits > 0 ? (count / totalUnits) * 100 : 0;
              return (
                <div key={type} className="bg-white p-4 rounded border text-center">
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <div className="text-sm text-gray-600">{type}</div>
                  <div className="text-xs text-gray-500">{percentage.toFixed(1)}% of portfolio</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    })()}

    {/* Action Buttons */}
    <div className="flex space-x-2 pt-4 border-t border-gray-200">
      <button
        onClick={() => {
          closeModal();
          openModal('addProperty');
        }}
        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
      >
        <Building className="w-4 h-4 mr-2" />
        Add New Property
      </button>
      <button
        onClick={() => {
          closeModal();
          setActiveTab('properties');
        }}
        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors"
      >
        <Edit className="w-4 h-4 mr-2" />
        Manage Properties
      </button>
      <button
        onClick={closeModal}
        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
      >
        Close
      </button>
    </div>
  </div>
)}

{/* FORM-BASED MODALS ONLY */}
{(modalType === 'addTenant' || modalType === 'editTenant' || 
  modalType === 'addProperty' || modalType === 'updateProperty' ||
  modalType === 'addWorkOrder' || modalType === 'editWorkOrder' ||
  modalType === 'addTransaction' || modalType === 'editTransaction') && (

          <form onSubmit={(e) => {
            e.preventDefault();
            console.log('Form submitting with data:', formData);
            handleSubmit(e);
             }} className="p-6 space-y-4">
            
{modalType === 'addTenant' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input 
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                    placeholder="Enter tenant's full name"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input 
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                    placeholder="tenant@example.com"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input 
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                    placeholder="(555) 123-4567"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property *</label>
                 <select 
                  value={formData.property || ''}
                  onChange={(e) => {
                  console.log('Property selected:', e.target.value);
                  handleInputChange('property', e.target.value);
                 }}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                 required
                 >
                 <option value="">Select a property</option>
                 {properties.map(prop => (
                  <option key={prop.id} value={prop.id}>{prop.name}</option>
  ))}
             </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit Number *</label>
                  <input 
                    type="text"
                    value={formData.unit || ''}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                    placeholder="e.g., A101, B205"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input 
                      type="number"
                      value={formData.rent || ''}
                      onChange={(e) => handleInputChange('rent', e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                      placeholder="2000"
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lease End Date *</label>
                  <input 
                    type="date"
                    value={formData.leaseEnd || ''}
                    onChange={(e) => handleInputChange('leaseEnd', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                    required 
                  />
                </div>
              </>
            )}

      {modalType === 'editTenant' && selectedItem && (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
      <input 
        type="text"
        value={formData.name || selectedItem.name}
        onChange={(e) => handleInputChange('name', e.target.value)} 
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
        placeholder="Enter tenant's full name"
        required 
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
      <input 
        type="email"
        value={formData.email || selectedItem.email}
        onChange={(e) => handleInputChange('email', e.target.value)} 
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
        placeholder="tenant@example.com"
        required 
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
      <input 
        type="tel"
        value={formData.phone || selectedItem.phone}
        onChange={(e) => handleInputChange('phone', e.target.value)} 
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
        placeholder="(555) 123-4567"
        required 
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Property *</label>
      <select 
        value={formData.property || selectedItem.propertyId || ''}
        onChange={(e) => {
          console.log('Property selected:', e.target.value);
          handleInputChange('property', e.target.value);
        }}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
        required
      >
        <option value="">Select a property</option>
        {properties.map(prop => (
          <option key={prop.id} value={prop.id}>{prop.name}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Unit Number *</label>
      <input 
        type="text"
        value={formData.unit || selectedItem.unit}
        onChange={(e) => handleInputChange('unit', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
        placeholder="e.g., A101, B205"
        required 
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent *</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
        <input 
          type="number"
          value={formData.rent || selectedItem.rent}
          onChange={(e) => handleInputChange('rent', e.target.value)}
          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
          placeholder="2000"
          required 
        />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Lease End Date *</label>
      <input 
        type="date"
        value={formData.leaseEnd || selectedItem.leaseEnd}
        onChange={(e) => handleInputChange('leaseEnd', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
        required 
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
      <select
        value={formData.status || selectedItem.status}
        onChange={(e) => handleInputChange('status', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <option value="Current">Current</option>
        <option value="Late">Late Payment</option>
        <option value="Notice">Notice Given</option>
        <option value="Former">Former Tenant</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Balance</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
        <input 
          type="number"
          value={formData.balance || selectedItem.balance || 0}
          onChange={(e) => handleInputChange('balance', parseFloat(e.target.value) || 0)}
          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
          placeholder="0.00"
          step="0.01"
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">Positive = tenant owes money, Negative = tenant has credit</p>
    </div>
  </>
)}      

       
      {modalType === 'addProperty' && (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Property Name *</label>
      <input 
        type="text"
        value={formData.name || ''}
        onChange={(e) => handleInputChange('name', e.target.value)} 
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
        placeholder="e.g., Sunset Apartments"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
      <textarea
        value={formData.address || ''}
        onChange={(e) => handleInputChange('address', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        rows="3"
        placeholder="123 Main St, City, State 12345"
        required
      ></textarea>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
      <select
        value={formData.type || ''}
        onChange={(e) => handleInputChange('type', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
        required
        >
        <option value="">Select property type</option>
        <option value="Apartment Complex">Apartment Complex</option>
        <option value="Condominiums">Condominiums</option>
        <option value="Single Family Home">Single Family Home</option>
        <option value="Townhouse">Townhouse</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Total Units *</label>
      <input 
        type="number"
        value={formData.units || ''}
        onChange={(e) => handleInputChange('units', parseInt(e.target.value) || '')}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        placeholder="24"
        min="1"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Price</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
        <input 
          type="number"
          value={formData.purchasePrice || ''}
          onChange={(e) => handleInputChange('purchasePrice', parseInt(e.target.value) || '')} 
          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
          placeholder="500000"
        />
      </div>
    </div>
  </>
)}

{modalType === 'addWorkOrder' && (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Property *</label>
      <select 
        value={formData.property || ''}
        onChange={(e) => {
          handleInputChange('property', e.target.value);
          // Clear tenant and unit when property changes
          handleInputChange('tenant', '');
          handleInputChange('unit', '');
        }}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        required
      >
        <option value="">Select a property</option>
        {properties.map(prop => (
          <option key={prop.id} value={prop.id}>{prop.name}</option>
        ))}
      </select>
    </div>

    {/* Add Tenant Selection */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Tenant (Optional)</label>
      <select
        value={formData.tenant || ''}
        onChange={(e) => {
          const selectedTenantName = e.target.value;
          handleInputChange('tenant', selectedTenantName);
          
          // Auto-fill unit based on selected tenant
          if (selectedTenantName) {
            const selectedProperty = properties.find(p => p.id === formData.property);
            const selectedTenant = tenants.find(tenant => 
              tenant.name === selectedTenantName && 
              tenant.property === selectedProperty?.name
            );
            if (selectedTenant) {
              handleInputChange('unit', selectedTenant.unit);
            }
          }
        }}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <option value="">Select tenant (optional)</option>
        {formData.property && tenants
          .filter(tenant => {
            const selectedProperty = properties.find(p => p.id === formData.property);
            return tenant.property === selectedProperty?.name;
          })
          .map(tenant => (
            <option key={tenant.id} value={tenant.name}>
              {tenant.name} - Unit {tenant.unit}
            </option>
          ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Unit Number *</label>
      <input 
        type="text"
        value={formData.unit || ''}
        onChange={(e) => handleInputChange('unit', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
        placeholder="e.g., A101"
        required
      />
      <p className="text-xs text-gray-500 mt-1">
        {formData.tenant ? 'Auto-filled from selected tenant' : 'Select a tenant above or enter manually'}
      </p>
    </div>

    {/* Rest of the addWorkOrder fields remain the same */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Issue Description *</label>
      <textarea 
        value={formData.issue || ''}
        onChange={(e) => handleInputChange('issue', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
        rows="3" 
        placeholder="Describe the maintenance issue..."
        required
      ></textarea>
    </div>
    {/* ... rest of fields ... */}
        <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level *</label>
      <select 
        value={formData.priority || ''}
        onChange={(e) => handleInputChange('priority', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
        required
      >
                    <option value="">Select priority</option>
                    <option value="Low">Low - Can wait a few days</option>
                    <option value="Medium">Medium - Should be addressed soon</option>
                    <option value="High">High - Needs immediate attention</option>
                    <option value="Emergency">Emergency - Critical issue</option>
                  </select>
                </div>
                <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
      <select 
        value={formData.category || ''}
        onChange={(e) => handleInputChange('category', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
        required
      >
                    <option value="">Select category</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="hvac">HVAC</option>
                    <option value="appliance">Appliance</option>
                    <option value="general">General Maintenance</option>
                  </select>
                </div>
  </>
)}


{modalType === 'editWorkOrder' && (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
      <select
        value={formData.property || ''}
        onChange={(e) => { handleInputChange('property', e.target.value);
          handleInputChange('tenant', '');
          handleInputChange('unit', '');
      }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">Select Property</option>
        {properties.map(property => (
          <option key={property.id} value={property.name}>
            {property.name}
          </option>
        ))}
      </select>
    </div>
<div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Tenant (Optional)</label>
      <select
        value={formData.tenant || ''}
        onChange={(e) => {
          const selectedTenantName = e.target.value;
          handleInputChange('tenant', selectedTenantName);
          
          // Auto-fill unit based on selected tenant
          if (selectedTenantName) {
            const selectedTenant = tenants.find(tenant => 
              tenant.name === selectedTenantName && 
              tenant.property === (formData.property || selectedItem.property)
            );
            if (selectedTenant) {
              handleInputChange('unit', selectedTenant.unit);
            }
          } else {
            // Clear unit if no tenant selected
            handleInputChange('unit', formData.unit || selectedItem.unit || '');
          }
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select tenant (optional)</option>
        {tenants
          .filter(tenant => tenant.property === (formData.property || selectedItem.property))
          .map(tenant => (
            <option key={tenant.id} value={tenant.name}>
              {tenant.name} - Unit {tenant.unit}
            </option>
          ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
      <input
        type="text"
        value={formData.unit || ''}
        onChange={(e) => handleInputChange('unit', e.target.value)}
        placeholder="e.g., A101, 2B"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
          <p className="text-xs text-gray-500 mt-1">
        {formData.tenant ? 'Auto-filled from selected tenant' : 'Enter unit number manually or select a tenant above'}
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Issue Description</label>
      <textarea
        value={formData.issue || ''}
        onChange={(e) => handleInputChange('issue', e.target.value)}
        placeholder="Describe the maintenance issue..."
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
      <select
        value={formData.priority || ''}
        onChange={(e) => handleInputChange('priority', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">Select Priority</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
      <select
        value={formData.status || ''}
        onChange={(e) => handleInputChange('status', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To (Optional)</label>
      <input
        type="text"
        value={formData.assignedTo || ''}
        onChange={(e) => handleInputChange('assignedTo', e.target.value)}
        placeholder="Contractor or maintenance person"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost (Optional)</label>
      <input
        type="number"
        step="0.01"
        value={formData.estimatedCost || ''}
        onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
        placeholder="0.00"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
      <textarea
        value={formData.description || ''}
        onChange={(e) => handleInputChange('description', e.target.value)}
        placeholder="Additional notes or updates..."
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>
)}



  
{modalType === 'updateProperty' && selectedItem && (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Property Name *</label>
      <input 
        type="text"
        value={formData.name || selectedItem.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
        placeholder="e.g., Sunset Apartments"
        required 
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
      <textarea
        value={formData.address || selectedItem.address}
        onChange={(e) => handleInputChange('address', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        rows="3"
        placeholder="123 Main St, City, State 12345"
        required
      ></textarea>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
      <select
        value={formData.type || selectedItem?.type}
        onChange={(e) => handleInputChange('type', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
        required
      >
        <option value="">Select property type</option>
        <option value="Apartment Complex">Apartment Complex</option>
        <option value="Condominiums">Condominiums</option>      
        <option value="Single Family Home">Single Family Home</option>
        <option value="Townhouse">Townhouse</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Total Units *</label>
      <input 
        type="number"
        value={formData.units || selectedItem.units}
        onChange={(e) => handleInputChange('units', parseInt(e.target.value) || '')}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        placeholder="24"
        min="1"
        required 
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Price</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
        <input 
          type="number"
          value={formData.purchasePrice || selectedItem.purchasePrice || ''}
          onChange={(e) => handleInputChange('purchasePrice', parseInt(e.target.value) || '')} 
          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
          placeholder="500000"
        />
      </div>
      <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Revenue (Override)</label>
  <div className="relative">
    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
    <input 
  type="number"
  value={formData.monthlyRevenue || ''}
  onChange={(e) => handleInputChange('monthlyRevenue', parseFloat(e.target.value) || 0)} // ← Add parseFloat
  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
  placeholder="Override automatic calculation"
/>
  </div>
  <p className="text-xs text-gray-500 mt-1">
  Auto-calculated: ${tenants.filter(t => t.property === selectedItem.name && t.status === 'Current').reduce((sum, t) => sum + (t.rent || 0), 0).toLocaleString()}
</p>
</div>
    </div>
  </>
)}

{modalType === 'addTransaction' && (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type *</label>
      <select
        value={formData.type || ''}
        onChange={(e) => handleInputChange('type', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        required
      >
        <option value="">Select transaction type</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
      <input 
        type="text"
        value={formData.description || ''}
        onChange={(e) => handleInputChange('description', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
        placeholder="e.g., Rent Payment - John Smith"
        required 
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
        <input 
          type="number"
          value={formData.amount || ''}
          onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || '')}
          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
          placeholder="0.00"
          step="0.01"
          required 
        />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
      <select
        value={formData.property || ''}
        onChange={(e) => handleInputChange('property', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <option value="">Select property (optional)</option>
        {properties.map(prop => (
          <option key={prop.id} value={prop.name}>{prop.name}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Unit Number (Optional)</label>
      <input
        type="text"
        value={formData.unit || ''}
        onChange={(e) => handleInputChange('unit', e.target.value)}
        placeholder="e.g., A101, 2B, 301, etc."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <p className="text-xs text-gray-500 mt-1">Enter the specific unit this transaction relates to</p>
    </div>

        {(formData.type === 'expense' || selectedItem?.type === 'expense') && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          value={formData.category || selectedItem?.category || ''}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <option value="">Select category</option>
          <option value="maintenance">Maintenance</option>
          <option value="utilities">Utilities</option>
          <option value="insurance">Insurance</option>
          <option value="taxes">Taxes</option>
          <option value="other">Other</option>
        </select>
      </div>
    )}

    {formData.type === 'income' && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tenant</label>
        <select
          value={formData.tenant || ''}
          onChange={(e) => handleInputChange('tenant', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <option value="">Select tenant (optional)</option>
          <>
          {tenants.map(tenant => (
            <option key={tenant.id} value={tenant.name}>{tenant.name}</option>
          ))}
          </>
        </select>
      </div>
    )}
    </>
  )}

{modalType === 'editTransaction' && selectedItem && (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type *</label>
      <select
        value={formData.type || selectedItem?.type}
        onChange={(e) => handleInputChange('type', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        required
      >
        <option value="">Select transaction type</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
      <input 
        type="text"
        value={formData.description || selectedItem?.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
        placeholder="e.g., Rent Payment - John Smith"
        required 
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
        <input 
          type="number"
          value={formData.amount || Math.abs(selectedItem?.amount)}
          onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || '')}
          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
          placeholder="0.00"
          step="0.01"
          required 
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
      <input 
        type="date"
        value={formData.date || selectedItem?.date}
        onChange={(e) => handleInputChange('date', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
        required 
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
      <select
        value={formData.property || selectedItem?.property || ''}
        onChange={(e) => handleInputChange('property', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <option value="">Select property (optional)</option>
        {properties.map(prop => (
          <option key={prop.id} value={prop.name}>{prop.name}</option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Unit Number (Optional)</label>
      <input
        type="text"
        value={formData.unit || selectedItem?.unit || ''}
        onChange={(e) => handleInputChange('unit', e.target.value)}
        placeholder="e.g., A101, 2B, 301, etc."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <p className="text-xs text-gray-500 mt-1">Enter the specific unit this transaction relates to</p>
    </div>

    {(formData.type === 'income' || selectedItem?.type === 'income') && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tenant</label>
        <select
          value={formData.tenant || selectedItem?.tenant || ''}
          onChange={(e) => handleInputChange('tenant', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <option value="">Select tenant (optional)</option>
          {tenants.map(tenant => (
            <option key={tenant.id} value={tenant.name}>{tenant.name}</option>
          ))}
        </select>
      </div>
    )}
          {(formData.type === 'expense' || selectedItem?.type === 'expense') && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          value={formData.category || selectedItem?.category || ''}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <option value="">Select category</option>
          <option value="maintenance">Maintenance</option>
          <option value="utilities">Utilities</option>
          <option value="insurance">Insurance</option>
          <option value="taxes">Taxes</option>
          <option value="other">Other</option>
        </select>
      </div>
    )}
  </>
)}

           <div className="flex space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>              
              <button
      type="submit"
      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      {modalType === 'addTenant' ? 'Add New Tenant' :
       modalType === 'editTenant' ? 'Update Tenant' :
       modalType === 'addProperty' ? 'Add New Property' :
       modalType === 'addWorkOrder' ? 'Create Work Order' : 
       modalType === 'editWorkOrder' ? 'Update Work Order' :
       modalType === 'updateProperty' ? 'Update Property' :
       modalType === 'addTransaction' ? 'Record Transaction' :
       modalType === 'editTransaction' ? 'Update Transaction' :
       'Submit'}

            </button>
          </div>
        </form>  
         )}    
      </div>
    </div>
  );
};
  

export default Modal;