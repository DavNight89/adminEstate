// src/components/ApplicationForm.jsx
import React, { useState } from 'react';
import { User, Briefcase, Home, Users, FileText, CheckCircle } from 'lucide-react';
import Application from '../models/Application';

export default function ApplicationForm({ propertyId, propertyName, properties = [], onSubmit, onCancel }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    propertyId: '',
    
    // Application Details
    
    propertyName: propertyName || '',
    desiredUnit: '',
    desiredMoveInDate: '',
    leaseTerm: 12,

    // Employment
    currentEmployer: '',
    jobTitle: '',
    employmentStartDate: '',
    monthlyIncome: '',
    employerPhone: '',
    additionalIncome: [],

    // Current Address
    currentAddress: {
      street: '',
      city: '',
      state: '',
      zip: '',
      landlordName: '',
      landlordPhone: '',
      monthlyRent: '',
      moveInDate: ''
    },

    // Previous Addresses
    previousAddresses: [],

    // Emergency Contact
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },

    // References
    personalReferences: [
      { name: '', relationship: '', phone: '', email: '' }
    ],

    // Occupants
    occupants: [],

    // Pets
    pets: [],

    // Vehicles
    vehicles: [],

    // Disclosures
    hasEvictions: false,
    hasBankruptcy: false,
    hasCriminalHistory: false,
    disclosureNotes: '',

    // Consent
    backgroundCheckConsent: false,
    creditCheckConsent: false,
    consentSignature: '',
    consentDate: null
  });

  const totalSteps = 6;

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData(prev => {
      const newArray = [...prev[arrayName]];
      newArray[index] = {
        ...newArray[index],
        [field]: value
      };
      return {
        ...prev,
        [arrayName]: newArray
      };
    });
  };

  const addToArray = (arrayName, defaultValue) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultValue]
    }));
  };

  const removeFromArray = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const validateCurrentStep = () => {
    const newErrors = [];

    switch (step) {
      case 1: // Personal Information
        if (!formData.firstName) newErrors.push('First name is required');
        if (!formData.lastName) newErrors.push('Last name is required');
        if (!formData.email) newErrors.push('Email is required');
        if (!formData.phone) newErrors.push('Phone is required');
        if (!formData.dateOfBirth) newErrors.push('Date of birth is required');
        if (!formData.propertyId) newErrors.push('Property selection is required');
        break;

      case 2: // Employment
        if (!formData.currentEmployer) newErrors.push('Current employer is required');
        if (!formData.jobTitle) newErrors.push('Job title is required');
        if (!formData.monthlyIncome || formData.monthlyIncome <= 0) {
          newErrors.push('Monthly income is required');
        }
        break;

      case 3: // Rental History
        if (!formData.currentAddress.street) newErrors.push('Current address is required');
        if (!formData.currentAddress.city) newErrors.push('City is required');
        if (!formData.currentAddress.state) newErrors.push('State is required');
        if (!formData.currentAddress.zip) newErrors.push('Zip code is required');
        break;

      case 4: // References & Emergency Contact
        if (!formData.emergencyContact.name) newErrors.push('Emergency contact name is required');
        if (!formData.emergencyContact.phone) newErrors.push('Emergency contact phone is required');
        break;

      case 6: // Consent
        if (!formData.backgroundCheckConsent) {
          newErrors.push('Background check consent is required');
        }
        if (!formData.creditCheckConsent) {
          newErrors.push('Credit check consent is required');
        }
        if (!formData.consentSignature) {
          newErrors.push('Electronic signature is required');
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate entire application
    const application = new Application(formData);
    const validation = application.validate();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Submit application
    onSubmit(application.toJSON());
  };

  const nextStep = () => {
    if (validateCurrentStep() && step < totalSteps) {
      setStep(step + 1);
      setErrors([]);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`w-1/6 h-2 mx-1 rounded ${
                i <= step ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 text-center">
          Step {step} of {totalSteps}
        </p>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <h4 className="font-bold text-red-800 mb-2">Please fix the following errors:</h4>
          <ul className="list-disc list-inside text-red-700 text-sm">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <User className="mr-2" /> Personal Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="555-123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Desired Move-In Date *</label>
                <input
                  type="date"
                  required
                  value={formData.desiredMoveInDate}
                  onChange={(e) => handleChange('desiredMoveInDate', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Desired Unit (Optional)</label>
                <input
                  type="text"
                  value={formData.desiredUnit}
                  onChange={(e) => handleChange('desiredUnit', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 101, 2B"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Property *</label>
                <select
                  value={formData.propertyId}
                  onChange={(e) => handleChange('propertyId', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select a property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Lease Term (months) *</label>
                <select
                  value={formData.leaseTerm}
                  onChange={(e) => handleChange('leaseTerm', parseInt(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value={6}>6 months</option>
                  <option value={12}>12 months</option>
                  <option value={18}>18 months</option>
                  <option value={24}>24 months</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Employment Information */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Briefcase className="mr-2" /> Employment Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Employer *</label>
                <input
                  type="text"
                  required
                  value={formData.currentEmployer}
                  onChange={(e) => handleChange('currentEmployer', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={formData.jobTitle}
                  onChange={(e) => handleChange('jobTitle', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Employment Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.employmentStartDate}
                  onChange={(e) => handleChange('employmentStartDate', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Monthly Gross Income *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleChange('monthlyIncome', parseFloat(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="$0.00"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Employer Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.employerPhone}
                  onChange={(e) => handleChange('employerPhone', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="555-123-4567"
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Additional Income (Optional)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Include other sources of income such as alimony, child support, investment income, etc.
              </p>
              {formData.additionalIncome.map((income, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Source (e.g., Freelance)"
                    value={income.source || ''}
                    onChange={(e) => handleArrayChange('additionalIncome', index, 'source', e.target.value)}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Monthly Amount"
                    value={income.monthlyAmount || ''}
                    onChange={(e) => handleArrayChange('additionalIncome', index, 'monthlyAmount', parseFloat(e.target.value))}
                    className="border rounded px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeFromArray('additionalIncome', index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addToArray('additionalIncome', { source: '', monthlyAmount: 0 })}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                + Add Additional Income
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Rental History */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Home className="mr-2" /> Rental History
            </h2>

            <h3 className="font-medium mb-4">Current Address *</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={formData.currentAddress.street}
                  onChange={(e) => handleNestedChange('currentAddress', 'street', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.currentAddress.city}
                  onChange={(e) => handleNestedChange('currentAddress', 'city', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={formData.currentAddress.state}
                  onChange={(e) => handleNestedChange('currentAddress', 'state', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="AL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Zip Code *</label>
                <input
                  type="text"
                  required
                  value={formData.currentAddress.zip}
                  onChange={(e) => handleNestedChange('currentAddress', 'zip', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Move-In Date</label>
                <input
                  type="date"
                  value={formData.currentAddress.moveInDate}
                  onChange={(e) => handleNestedChange('currentAddress', 'moveInDate', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Landlord Name</label>
                <input
                  type="text"
                  value={formData.currentAddress.landlordName}
                  onChange={(e) => handleNestedChange('currentAddress', 'landlordName', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Landlord Phone</label>
                <input
                  type="tel"
                  value={formData.currentAddress.landlordPhone}
                  onChange={(e) => handleNestedChange('currentAddress', 'landlordPhone', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Monthly Rent</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.currentAddress.monthlyRent}
                  onChange={(e) => handleNestedChange('currentAddress', 'monthlyRent', parseFloat(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="$0.00"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: References & Emergency Contact */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Users className="mr-2" /> References & Emergency Contact
            </h2>

            <h3 className="font-medium mb-4">Emergency Contact *</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.emergencyContact.name}
                  onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Relationship *</label>
                <input
                  type="text"
                  required
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => handleNestedChange('emergencyContact', 'relationship', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., Mother, Friend"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.emergencyContact.phone}
                  onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <h3 className="font-medium mb-4">Personal References</h3>
            <p className="text-sm text-gray-600 mb-4">
              Provide at least one personal reference (not family members).
            </p>
            {formData.personalReferences.map((ref, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={ref.name || ''}
                  onChange={(e) => handleArrayChange('personalReferences', index, 'name', e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Relationship"
                  value={ref.relationship || ''}
                  onChange={(e) => handleArrayChange('personalReferences', index, 'relationship', e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={ref.phone || ''}
                  onChange={(e) => handleArrayChange('personalReferences', index, 'phone', e.target.value)}
                  className="border rounded px-3 py-2"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeFromArray('personalReferences', index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addToArray('personalReferences', { name: '', relationship: '', phone: '', email: '' })}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              + Add Reference
            </button>
          </div>
        )}

        {/* Step 5: Additional Information */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FileText className="mr-2" /> Additional Information
            </h2>

            <h3 className="font-medium mb-4">Background Disclosures</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please answer honestly. A "yes" answer does not automatically disqualify you.
            </p>

            <div className="space-y-3 mb-6">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.hasEvictions}
                  onChange={(e) => handleChange('hasEvictions', e.target.checked)}
                  className="mt-1 mr-2"
                />
                <span className="text-sm">
                  Have you ever been evicted or asked to vacate a rental property?
                </span>
              </label>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.hasBankruptcy}
                  onChange={(e) => handleChange('hasBankruptcy', e.target.checked)}
                  className="mt-1 mr-2"
                />
                <span className="text-sm">
                  Have you filed for bankruptcy in the past 7 years?
                </span>
              </label>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.hasCriminalHistory}
                  onChange={(e) => handleChange('hasCriminalHistory', e.target.checked)}
                  className="mt-1 mr-2"
                />
                <span className="text-sm">
                  Do you have any criminal convictions?
                </span>
              </label>
            </div>

            {(formData.hasEvictions || formData.hasBankruptcy || formData.hasCriminalHistory) && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">
                  Please provide details (optional)
                </label>
                <textarea
                  value={formData.disclosureNotes}
                  onChange={(e) => handleChange('disclosureNotes', e.target.value)}
                  rows={4}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Provide any additional context..."
                />
              </div>
            )}

            <h3 className="font-medium mb-4">Pets (Optional)</h3>
            {formData.pets.map((pet, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Type (Dog, Cat, etc.)"
                  value={pet.type || ''}
                  onChange={(e) => handleArrayChange('pets', index, 'type', e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Breed"
                  value={pet.breed || ''}
                  onChange={(e) => handleArrayChange('pets', index, 'breed', e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Weight (lbs)"
                  value={pet.weight || ''}
                  onChange={(e) => handleArrayChange('pets', index, 'weight', parseInt(e.target.value))}
                  className="border rounded px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => removeFromArray('pets', index)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addToArray('pets', { type: '', breed: '', weight: 0 })}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 mb-6"
            >
              + Add Pet
            </button>

            <h3 className="font-medium mb-4">Vehicles (Optional)</h3>
            {formData.vehicles.map((vehicle, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Make"
                  value={vehicle.make || ''}
                  onChange={(e) => handleArrayChange('vehicles', index, 'make', e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Model"
                  value={vehicle.model || ''}
                  onChange={(e) => handleArrayChange('vehicles', index, 'model', e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="License Plate"
                  value={vehicle.licensePlate || ''}
                  onChange={(e) => handleArrayChange('vehicles', index, 'licensePlate', e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => removeFromArray('vehicles', index)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addToArray('vehicles', { make: '', model: '', licensePlate: '' })}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              + Add Vehicle
            </button>
          </div>
        )}

        {/* Step 6: Consent & Signature */}
        {step === 6 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <CheckCircle className="mr-2" /> Review & Consent
            </h2>

            <div className="bg-gray-50 border rounded p-4 mb-6">
              <h3 className="font-bold mb-2">Application Summary</h3>
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Property:</strong> {formData.propertyName}</p>
                <p><strong>Desired Move-In:</strong> {formData.desiredMoveInDate}</p>
                <p><strong>Monthly Income:</strong> ${formData.monthlyIncome}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 border rounded bg-blue-50">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.backgroundCheckConsent}
                    onChange={(e) => handleChange('backgroundCheckConsent', e.target.checked)}
                    className="mt-1 mr-3"
                  />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Background Check Authorization *</p>
                    <p className="text-gray-700">
                      I authorize a background check to be conducted in accordance with the Fair Credit Reporting Act (FCRA).
                      This may include criminal history, eviction history, and other public records.
                    </p>
                  </div>
                </label>
              </div>

              <div className="p-4 border rounded bg-blue-50">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.creditCheckConsent}
                    onChange={(e) => handleChange('creditCheckConsent', e.target.checked)}
                    className="mt-1 mr-3"
                  />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Credit Check Authorization *</p>
                    <p className="text-gray-700">
                      I authorize a credit check to be conducted as part of this rental application.
                      I understand this may affect my credit score.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Electronic Signature *
              </label>
              <p className="text-sm text-gray-600 mb-2">
                By typing your full name below, you are electronically signing this application and certifying
                that all information provided is true and accurate.
              </p>
              <input
                type="text"
                required
                value={formData.consentSignature}
                onChange={(e) => handleChange('consentSignature', e.target.value)}
                className="w-full border-2 rounded px-3 py-2 font-serif text-lg"
                placeholder="Type your full legal name"
              />
              <p className="text-xs text-gray-500 mt-1">
                Date: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Submission of false information may result in denial of your application
                or termination of your lease agreement.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={step === 1 ? onCancel : prevStep}
            className="px-6 py-2 border rounded hover:bg-gray-50 transition"
          >
            {step === 1 ? 'Cancel' : 'Previous'}
          </button>

          {step < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Next Step
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-bold"
            >
              Submit Application
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
