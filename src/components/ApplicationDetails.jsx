// src/components/ApplicationDetails.jsx
import React, { useState } from 'react';
import {
  X,
  User,
  Briefcase,
  Home,
  Users,
  FileText,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  UserCheck,
  Shield
} from 'lucide-react';
import ScreeningChecklist from './ScreeningChecklist';

export default function ApplicationDetails({
  application,
  onClose,
  onEdit,
  onUpdateStatus,
  onDelete,
  onConvertToTenant,
  onUpdateScreening
}) {
  const [activeTab, setActiveTab] = useState('personal');
  const [screening, setScreening] = useState(application.screening || null);

  if (!application) return null;

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'address', label: 'Address History', icon: Home },
    { id: 'references', label: 'References', icon: Users },
    { id: 'screening', label: 'Screening', icon: Shield },
    { id: 'additional', label: 'Additional', icon: FileText },
    { id: 'disclosures', label: 'Disclosures', icon: AlertCircle }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      submitted: { color: 'bg-blue-100', textColor: 'text-blue-900', icon: CheckCircle, text: 'Submitted' },
      screening: { color: 'bg-yellow-100', textColor: 'text-yellow-900', icon: AlertCircle, text: 'Screening' },
      approved: { color: 'bg-green-100', textColor: 'text-green-900', icon: CheckCircle, text: 'Approved' },
      conditional: { color: 'bg-purple-100', textColor: 'text-purple-900', icon: UserCheck, text: 'Conditional' },
      rejected: { color: 'bg-red-100', textColor: 'text-red-900', icon: XCircle, text: 'Rejected' },
      withdrawn: { color: 'bg-gray-100', textColor: 'text-gray-900', icon: XCircle, text: 'Withdrawn' }
    };

    const badge = badges[status] || badges.submitted;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${badge.color} ${badge.textColor}`} style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)'}}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start py-3 border-b last:border-b-0">
      {Icon && <Icon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />}
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-500">{label}</div>
        <div className="text-base text-gray-900 mt-1">{value || 'Not provided'}</div>
      </div>
    </div>
  );

  const calculateIncomeRatio = () => {
    if (!application.monthlyIncome) return 'N/A';
    // Assuming typical rent is 30% of income
    const estimatedRent = application.monthlyIncome * 0.3;
    return `${estimatedRent.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} max rent (30% rule)`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[100vh] overflow flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {application.firstName} {application.lastName}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Application ID: {application.id} • Submitted {new Date(application.submittedDate).toLocaleDateString()}
              </p>
            </div>
            {getStatusBadge(application.status)}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Summary */}
        <div className="px-6 py-4 bg-blue-50 border-b">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-xs font-medium text-blue-600 uppercase">Property</div>
              <div className="text-sm font-bold text-blue-900 mt-1">{application.propertyName}</div>
              {application.desiredUnit && (
                <div className="text-xs text-blue-700">Unit {application.desiredUnit}</div>
              )}
            </div>
            <div>
              <div className="text-xs font-medium text-blue-600 uppercase">Move-In Date</div>
              <div className="text-sm font-bold text-blue-900 mt-1">
                {new Date(application.desiredMoveInDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-blue-600 uppercase">Monthly Income</div>
              <div className="text-sm font-bold text-blue-900 mt-1">
                ${application.monthlyIncome?.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-blue-600 uppercase">Lease Term</div>
              <div className="text-sm font-bold text-blue-900 mt-1">
                {application.leaseTerm} months
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 py-2 bg-white border-b">
          <nav className="px-4 flex space-x-4">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-4">Personal Information</h3>
                <InfoRow label="Full Name" value={`${application.firstName} ${application.lastName}`} icon={User} />
                <InfoRow label="Email" value={application.email} icon={Mail} />
                <InfoRow label="Phone" value={application.phone} icon={Phone} />
                <InfoRow label="Date of Birth" value={new Date(application.dateOfBirth).toLocaleDateString()} icon={Calendar} />
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-4">Emergency Contact</h3>
                <InfoRow
                  label="Name"
                  value={application.emergencyContact?.name}
                  icon={User}
                />
                <InfoRow
                  label="Relationship"
                  value={application.emergencyContact?.relationship}
                />
                <InfoRow
                  label="Phone"
                  value={application.emergencyContact?.phone}
                  icon={Phone}
                />
              </div>
            </div>
          )}

          {/* Employment Tab */}
          {activeTab === 'employment' && (
            <div className="space-y-4">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-4">Current Employment</h3>
                <InfoRow label="Employer" value={application.currentEmployer} icon={Briefcase} />
                <InfoRow label="Job Title" value={application.jobTitle} />
                <InfoRow
                  label="Start Date"
                  value={new Date(application.employmentStartDate).toLocaleDateString()}
                  icon={Calendar}
                />
                <InfoRow
                  label="Monthly Income"
                  value={`$${application.monthlyIncome?.toLocaleString()}`}
                  icon={DollarSign}
                />
                <InfoRow label="Employer Phone" value={application.employerPhone} icon={Phone} />
              </div>

              {application.additionalIncome && application.additionalIncome.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-4">Additional Income Sources</h3>
                  {application.additionalIncome.map((income, index) => (
                    <div key={index} className="py-3 border-b last:border-b-0">
                      <div className="flex justify-between">
                        <span className="font-medium">{income.source}</span>
                        <span className="text-green-600 font-bold">
                          ${income.monthlyAmount?.toLocaleString()}/mo
                        </span>
                      </div>
                      {income.description && (
                        <p className="text-sm text-gray-600 mt-1">{income.description}</p>
                      )}
                    </div>
                  ))}
                  <div className="pt-3 mt-3 border-t">
                    <div className="flex justify-between font-bold">
                      <span>Total Monthly Income</span>
                      <span className="text-green-600">
                        ${(application.monthlyIncome +
                          application.additionalIncome.reduce((sum, i) => sum + (i.monthlyAmount || 0), 0)
                        ).toLocaleString()}/mo
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Income Analysis</h4>
                <p className="text-sm text-blue-800">{calculateIncomeRatio()}</p>
              </div>
            </div>
          )}

          {/* Address History Tab */}
          {activeTab === 'address' && (
            <div className="space-y-4">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-4">Current Address</h3>
                <InfoRow
                  label="Street"
                  value={application.currentAddress?.street}
                  icon={MapPin}
                />
                <InfoRow
                  label="City, State, Zip"
                  value={`${application.currentAddress?.city}, ${application.currentAddress?.state} ${application.currentAddress?.zip}`}
                />
                <InfoRow
                  label="Move-In Date"
                  value={application.currentAddress?.moveInDate
                    ? new Date(application.currentAddress.moveInDate).toLocaleDateString()
                    : 'Not provided'}
                  icon={Calendar}
                />
                <InfoRow
                  label="Monthly Rent"
                  value={application.currentAddress?.monthlyRent
                    ? `$${application.currentAddress.monthlyRent.toLocaleString()}`
                    : 'Not provided'}
                  icon={DollarSign}
                />
                <InfoRow
                  label="Landlord"
                  value={application.currentAddress?.landlordName}
                  icon={User}
                />
                <InfoRow
                  label="Landlord Phone"
                  value={application.currentAddress?.landlordPhone}
                  icon={Phone}
                />
              </div>

              {application.previousAddresses && application.previousAddresses.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-4">Previous Addresses</h3>
                  {application.previousAddresses.map((addr, index) => (
                    <div key={index} className="mb-4 pb-4 border-b last:border-b-0">
                      <div className="font-medium mb-2">Address {index + 1}</div>
                      <p className="text-sm text-gray-700">{addr.street}</p>
                      <p className="text-sm text-gray-700">
                        {addr.city}, {addr.state} {addr.zip}
                      </p>
                      {addr.landlordName && (
                        <p className="text-sm text-gray-600 mt-1">
                          Landlord: {addr.landlordName} ({addr.landlordPhone})
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* References Tab */}
          {activeTab === 'references' && (
            <div className="space-y-4">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-4">Personal References</h3>
                {application.personalReferences && application.personalReferences.length > 0 ? (
                  application.personalReferences.map((ref, index) => (
                    <div key={index} className="py-3 border-b last:border-b-0">
                      <div className="flex items-start">
                        <Users className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{ref.name}</div>
                          <div className="text-sm text-gray-600">
                            {ref.relationship} • {ref.phone}
                          </div>
                          {ref.email && (
                            <div className="text-sm text-gray-600">{ref.email}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No references provided</p>
                )}
              </div>
            </div>
          )}

          {/* Additional Info Tab */}
          {activeTab === 'additional' && (
            <div className="space-y-4">
              {/* Occupants */}
              {application.occupants && application.occupants.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-4">Additional Occupants</h3>
                  {application.occupants.map((occupant, index) => (
                    <div key={index} className="py-2 border-b last:border-b-0">
                      <span className="font-medium">{occupant.name}</span>
                      <span className="text-gray-600 text-sm ml-2">
                        ({occupant.relationship}, {occupant.age ? `${occupant.age} years` : 'age not provided'})
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Pets */}
              {application.pets && application.pets.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-4">Pets</h3>
                  {application.pets.map((pet, index) => (
                    <div key={index} className="py-2 border-b last:border-b-0">
                      <span className="font-medium">{pet.type}</span>
                      {pet.breed && <span className="text-gray-600 ml-2">• {pet.breed}</span>}
                      {pet.weight && <span className="text-gray-600 ml-2">• {pet.weight} lbs</span>}
                      {pet.name && <span className="text-gray-600 ml-2">• Name: {pet.name}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Vehicles */}
              {application.vehicles && application.vehicles.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-4">Vehicles</h3>
                  {application.vehicles.map((vehicle, index) => (
                    <div key={index} className="py-2 border-b last:border-b-0">
                      <span className="font-medium">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </span>
                      <span className="text-gray-600 ml-2">• {vehicle.licensePlate}</span>
                      {vehicle.color && <span className="text-gray-600 ml-2">• {vehicle.color}</span>}
                    </div>
                  ))}
                </div>
              )}

              {!application.occupants?.length && !application.pets?.length && !application.vehicles?.length && (
                <div className="text-center py-8 text-gray-500">
                  No additional information provided
                </div>
              )}
            </div>
          )}

          {/* Screening Tab */}
          {activeTab === 'screening' && (
            <div className="space-y-4">
              <ScreeningChecklist
                application={application}
                screening={screening}
                onUpdate={(updatedScreening) => {
                  setScreening(updatedScreening);
                  // Save to backend/localStorage
                  if (onUpdateScreening) {
                    onUpdateScreening(updatedScreening);
                  }
                }}
                onComplete={(completedScreening) => {
                  setScreening(completedScreening);
                  // Save completed screening
                  if (onUpdateScreening) {
                    onUpdateScreening(completedScreening);
                  }
                  // Auto-update application status to screening
                  if (application.status === 'submitted') {
                    onUpdateStatus(application.id, 'screening');
                  }
                }}
              />
            </div>
          )}

          {/* Disclosures Tab */}
          {activeTab === 'disclosures' && (
            <div className="space-y-4">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-4">Background Disclosures</h3>

                <div className="space-y-3">
                  <div className={`flex items-center p-3 rounded ${application.hasEvictions ? 'bg-yellow-50' : 'bg-green-50'}`}>
                    <div className="flex-1">
                      <span className="font-medium">Evictions or Lease Violations</span>
                    </div>
                    {application.hasEvictions ? (
                      <span className="text-yellow-700 font-medium">Yes</span>
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>

                  <div className={`flex items-center p-3 rounded ${application.hasBankruptcy ? 'bg-yellow-50' : 'bg-green-50'}`}>
                    <div className="flex-1">
                      <span className="font-medium">Bankruptcy (past 7 years)</span>
                    </div>
                    {application.hasBankruptcy ? (
                      <span className="text-yellow-700 font-medium">Yes</span>
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>

                  <div className={`flex items-center p-3 rounded ${application.hasCriminalHistory ? 'bg-yellow-50' : 'bg-green-50'}`}>
                    <div className="flex-1">
                      <span className="font-medium">Criminal Convictions</span>
                    </div>
                    {application.hasCriminalHistory ? (
                      <span className="text-yellow-700 font-medium">Yes</span>
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </div>

                {application.disclosureNotes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <div className="font-medium text-sm text-gray-700 mb-1">Additional Details:</div>
                    <p className="text-sm text-gray-600">{application.disclosureNotes}</p>
                  </div>
                )}
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-4">Consent & Authorization</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm">Background check consent provided</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm">Credit check consent provided</span>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      <strong>Electronic Signature:</strong> {application.consentSignature}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Signed on {new Date(application.consentDate || application.submittedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(application)}
                className="px-4 py-2 border rounded hover:bg-gray-100 flex items-center gap-2 transition"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(application)}
                className="px-4 py-2 border border-red-200 text-red-700 rounded hover:bg-red-50 flex items-center gap-2 transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {/* Status Change Dropdown - Always visible for editable statuses */}
            {onUpdateStatus && application.status !== 'withdrawn' && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Change Status:</span>
                <select
                  value={application.status}
                  onChange={(e) => onUpdateStatus(application.id, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                >
                  <option value="submitted">Submitted</option>
                  <option value="screening">Screening</option>
                  <option value="approved">Approved</option>
                  <option value="conditional">Conditional</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
            )}

            {/* Convert to Tenant button - only for approved applications */}
            {application.status === 'approved' && !application.tenantId && onConvertToTenant && (
              <button
                onClick={() => onConvertToTenant(application)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Convert to Tenant
              </button>
            )}

            {/* Tenant Converted badge */}
            {application.status === 'approved' && application.tenantId && (
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Converted to Tenant
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
