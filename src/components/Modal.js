import React from 'react';
import { 
  X, MapPin, DollarSign, Users, Edit, Eye 
} from 'lucide-react';



const Modal = ({showModal, 
  modalType, 
  closeModal, 
  handleSubmit, 
  formData,  
  selectedItem,
  handleInputChange,
  properties,
  tenants,
  setActiveTab
}) => {
  if (!showModal) return null;
  
    
  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
          {modalType === 'addTenant' ? 'Add New Tenant' :
           modalType === 'addProperty' ? 'Add New Property' :
           modalType === 'addWorkOrder' ? 'Create Work Order' :
           modalType === 'updateProperty' ? 'Update Property' :
           modalType === 'addTransaction' ? 'Record Transaction' :
           modalType === 'editTransaction' ? 'Update Transaction' :
           modalType === 'viewProperty' ? selectedItem?.name || 'Property Details' : 'Modal' }
           </h3>
            <button 
              onClick={closeModal} 
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                   onChange={(e) => handleInputChange('property', e.target.value)}
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" required>
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
        onChange={(e) => handleInputChange('property', e.target.value)}
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
                    placeholder="e.g., A101"
                    required
                  />
                
                </div>
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
        value={formData.type || selectedItem.type}
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
    {formData.type === 'income' && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tenant</label>
        <select
          value={formData.tenant || ''}
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
    {formData.type === 'expense' && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          value={formData.category || ''}
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


{modalType === 'editTransaction' && selectedItem && (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type *</label>
      <select
        value={formData.type || selectedItem.type}
        onChange={(e) => handleInputChange('type', parseFloat(e.target.value) || 0)}
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
        value={formData.description || selectedItem.description}
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
          value={formData.amount || Math.abs(selectedItem.amount)}
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
        value={formData.date || selectedItem.date}
        onChange={(e) => handleInputChange('date', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
        required 
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
      <select
        value={formData.property || selectedItem.property || ''}
        onChange={(e) => handleInputChange('property', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <option value="">Select property (optional)</option>
        {properties.map(prop => (
          <option key={prop.id} value={prop.name}>{prop.name}</option>
        ))}
      </select>
    </div>
    {(formData.type === 'income' || selectedItem.type === 'income') && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tenant</label>
        <select
          value={formData.tenant || selectedItem.tenant || ''}
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
    {(formData.type === 'expense' || selectedItem.type === 'expense') && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          value={formData.category || selectedItem.category || ''}
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
       modalType === 'addProperty' ? 'Add New Property' :
       modalType === 'addWorkOrder' ? 'Create Work Order' :  // ← Fixed typo
       modalType === 'processedProperty' ? 'Update Property' :
       modalType === 'addTransaction' ? 'Record Transaction' :
       modalType === 'editTransaction' ? 'Update Transaction' : 'Submit'}
    </button>
            </div>
         </form>
        </div>
      </div>
  )
}

export default Modal;