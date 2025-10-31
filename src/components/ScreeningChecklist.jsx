// src/components/ScreeningChecklist.jsx
import React, { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, Clock, AlertTriangle, DollarSign,
  User, Briefcase, Home, FileText, Shield, TrendingUp, Star
} from 'lucide-react';
import Screening from '../models/Screening';

export default function ScreeningChecklist({ application, screening: initialScreening, onUpdate, onComplete }) {
  const [screening, setScreening] = useState(
    initialScreening || new Screening({ applicationId: application.id })
  );
  const [activeSection, setActiveSection] = useState('income');

  useEffect(() => {
    // Recalculate score whenever screening changes
    const updatedScreening = { ...screening };
    const score = new Screening(updatedScreening).calculateOverallScore();
    const recommendation = new Screening(updatedScreening).generateRecommendation();

    setScreening(prev => ({
      ...prev,
      overallScore: score,
      recommendation: recommendation
    }));
  }, [
    screening.documentReview,
    screening.backgroundCheck,
    screening.creditCheck,
    screening.employmentVerification,
    screening.rentalHistory,
    screening.incomeVerification
  ]);

  const handleUpdate = (section, field, value) => {
    const updated = {
      ...screening,
      [section]: {
        ...screening[section],
        [field]: value
      },
      updatedAt: new Date().toISOString()
    };

    setScreening(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const handleIncomeCalculation = () => {
    const screeningObj = new Screening(screening);
    const ratio = screeningObj.calculateRentToIncomeRatio(
      application.monthlyIncome || 0,
      application.proposedRent || 0,
      0
    );

    setScreening(prev => ({
      ...prev,
      incomeVerification: screeningObj.incomeVerification
    }));
  };

  const handleCompleteScreening = () => {
    const screeningObj = new Screening(screening);
    const score = screeningObj.calculateOverallScore();
    const recommendation = screeningObj.generateRecommendation();

    const completed = {
      ...screening,
      status: 'completed',
      overallScore: score,
      recommendation: recommendation,
      recommendationReason: screeningObj.recommendationReason,
      conditions: screeningObj.conditions,
      reviewedDate: new Date().toISOString(),
      reviewedBy: 'Property Manager'
    };

    setScreening(completed);
    if (onComplete) {
      onComplete(completed);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'not_started':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendationBadge = (recommendation) => {
    const badges = {
      approve: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approve' },
      conditional: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, text: 'Conditional' },
      reject: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Reject' }
    };

    const badge = badges[recommendation] || badges.approve;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  const sections = [
    { id: 'income', label: 'Income Verification', icon: DollarSign },
    { id: 'credit', label: 'Credit Check', icon: TrendingUp },
    { id: 'background', label: 'Background Check', icon: Shield },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'rental', label: 'Rental History', icon: Home },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  const completionPercentage = new Screening(screening).getCompletionPercentage();

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header with Score */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Screening Assessment</h3>
            <p className="text-sm text-gray-600">
              Complete all verification steps to generate a recommendation
            </p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(screening.overallScore)}`}>
              {screening.overallScore}
            </div>
            <div className="text-sm text-gray-600 mt-1">Risk Score</div>
            {screening.recommendation && (
              <div className="mt-2">
                {getRecommendationBadge(screening.recommendation)}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Screening Progress</span>
            <span>{completionPercentage}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="border-b">
        <nav className="flex space-x-2 px-4 overflow-x-auto" aria-label="Tabs">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-3 px-2 border-b-2 font-medium text-xs flex items-center gap-1 whitespace-nowrap ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Section Content */}
      <div className="p-4">
        {/* Income Verification */}
        {activeSection === 'income' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Income Verification
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Income
                </label>
                <input
                  type="number"
                  value={application.monthlyIncome || ''}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proposed Rent
                </label>
                <input
                  type="number"
                  value={application.proposedRent || ''}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                />
              </div>
            </div>

            <button
              onClick={handleIncomeCalculation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Calculate Ratio
            </button>

            {screening.incomeVerification.rentToIncomeRatio > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Rent-to-Income Ratio:</span>
                  <span className={`text-lg font-bold ${
                    screening.incomeVerification.meetsRequirements ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {screening.incomeVerification.rentToIncomeRatio.toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {screening.incomeVerification.meetsRequirements ? (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Meets 3x income requirement
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Does not meet 3x income requirement
                    </span>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={screening.incomeVerification.notes}
                onChange={(e) => handleUpdate('incomeVerification', 'notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Additional income verification notes..."
              />
            </div>
          </div>
        )}

        {/* Credit Check */}
        {activeSection === 'credit' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Credit Check
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={screening.creditCheck.status}
                  onChange={(e) => handleUpdate('creditCheck', 'status', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credit Score
                </label>
                <input
                  type="number"
                  value={screening.creditCheck.creditScore || ''}
                  onChange={(e) => handleUpdate('creditCheck', 'creditScore', parseInt(e.target.value))}
                  placeholder="300-850"
                  min="300"
                  max="850"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={screening.creditCheck.collections}
                  onChange={(e) => handleUpdate('creditCheck', 'collections', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <span className="text-sm text-gray-700">Collections on Record</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={screening.creditCheck.bankruptcies}
                  onChange={(e) => handleUpdate('creditCheck', 'bankruptcies', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <span className="text-sm text-gray-700">Bankruptcies</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={screening.creditCheck.evictions}
                  onChange={(e) => handleUpdate('creditCheck', 'evictions', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <span className="text-sm text-gray-700">Prior Evictions</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Details
              </label>
              <textarea
                value={screening.creditCheck.details}
                onChange={(e) => handleUpdate('creditCheck', 'details', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Credit check details and findings..."
              />
            </div>
          </div>
        )}

        {/* Background Check */}
        {activeSection === 'background' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Background Check
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={screening.backgroundCheck.status}
                  onChange={(e) => handleUpdate('backgroundCheck', 'status', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Result
                </label>
                <select
                  value={screening.backgroundCheck.result || ''}
                  onChange={(e) => handleUpdate('backgroundCheck', 'result', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Result</option>
                  <option value="clear">Clear</option>
                  <option value="flagged">Flagged</option>
                  <option value="denied">Denied</option>
                </select>
              </div>
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={screening.backgroundCheck.criminalHistory}
                onChange={(e) => handleUpdate('backgroundCheck', 'criminalHistory', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 mr-2"
              />
              <span className="text-sm text-gray-700">Criminal History Found</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Details
              </label>
              <textarea
                value={screening.backgroundCheck.details}
                onChange={(e) => handleUpdate('backgroundCheck', 'details', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Background check details and findings..."
              />
            </div>
          </div>
        )}

        {/* Employment Verification */}
        {activeSection === 'employment' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Employment Verification
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={screening.employmentVerification.status}
                onChange={(e) => handleUpdate('employmentVerification', 'status', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={screening.employmentVerification.employerConfirmed}
                  onChange={(e) => handleUpdate('employmentVerification', 'employerConfirmed', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <span className="text-sm text-gray-700">Employer Confirmed</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={screening.employmentVerification.positionConfirmed}
                  onChange={(e) => handleUpdate('employmentVerification', 'positionConfirmed', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <span className="text-sm text-gray-700">Position Confirmed</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={screening.employmentVerification.incomeConfirmed}
                  onChange={(e) => handleUpdate('employmentVerification', 'incomeConfirmed', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <span className="text-sm text-gray-700">Income Confirmed</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={screening.employmentVerification.contactedPerson}
                onChange={(e) => handleUpdate('employmentVerification', 'contactedPerson', e.target.value)}
                placeholder="Name of person contacted"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={screening.employmentVerification.notes}
                onChange={(e) => handleUpdate('employmentVerification', 'notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Employment verification notes..."
              />
            </div>
          </div>
        )}

        {/* Rental History */}
        {activeSection === 'rental' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Home className="w-5 h-5 text-blue-600" />
              Rental History Verification
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={screening.rentalHistory.status}
                onChange={(e) => handleUpdate('rentalHistory', 'status', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={screening.rentalHistory.currentLandlordContacted}
                  onChange={(e) => handleUpdate('rentalHistory', 'currentLandlordContacted', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <span className="text-sm text-gray-700">Current Landlord Contacted</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={screening.rentalHistory.previousLandlordContacted}
                  onChange={(e) => handleUpdate('rentalHistory', 'previousLandlordContacted', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <span className="text-sm text-gray-700">Previous Landlord Contacted</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paid Rent On Time?
                </label>
                <select
                  value={screening.rentalHistory.paidOnTime === null ? '' : screening.rentalHistory.paidOnTime.toString()}
                  onChange={(e) => handleUpdate('rentalHistory', 'paidOnTime', e.target.value === 'true')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Would Rent Again?
                </label>
                <select
                  value={screening.rentalHistory.wouldRentAgain === null ? '' : screening.rentalHistory.wouldRentAgain.toString()}
                  onChange={(e) => handleUpdate('rentalHistory', 'wouldRentAgain', e.target.value === 'true')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={screening.rentalHistory.notes}
                onChange={(e) => handleUpdate('rentalHistory', 'notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Rental history verification notes..."
              />
            </div>
          </div>
        )}

        {/* Document Review */}
        {activeSection === 'documents' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Document Review
            </h4>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={screening.documentReview.idVerified}
                  onChange={(e) => handleUpdate('documentReview', 'idVerified', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <span className="text-sm text-gray-700">ID Verified</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={screening.documentReview.payStubsVerified}
                  onChange={(e) => handleUpdate('documentReview', 'payStubsVerified', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <span className="text-sm text-gray-700">Pay Stubs Verified</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={screening.documentReview.bankStatementsReviewed}
                  onChange={(e) => handleUpdate('documentReview', 'bankStatementsReviewed', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <span className="text-sm text-gray-700">Bank Statements Reviewed</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={screening.documentReview.proofOfEmployment}
                  onChange={(e) => handleUpdate('documentReview', 'proofOfEmployment', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 mr-2"
                />
                <span className="text-sm text-gray-700">Proof of Employment</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={screening.documentReview.notes}
                onChange={(e) => handleUpdate('documentReview', 'notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Document review notes..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer with Actions */}
      <div className="p-4 border-t bg-gray-50">
        {screening.recommendation && (
          <div className="mb-4 p-4 bg-white border rounded-lg">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-yellow-500 mt-1" />
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900 mb-1">Recommendation</h5>
                <p className="text-sm text-gray-600 mb-2">
                  {new Screening(screening).recommendationReason}
                </p>
                {screening.conditions && screening.conditions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Suggested Conditions:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {screening.conditions.map((condition, index) => (
                        <li key={index}>{condition}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <div className="text-sm text-gray-600">
            Completion: {completionPercentage}%
          </div>
          <button
            onClick={handleCompleteScreening}
            disabled={completionPercentage < 100}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Complete Screening
          </button>
        </div>
      </div>
    </div>
  );
}
