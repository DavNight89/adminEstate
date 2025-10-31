import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import {
  parseCSV,
  readCSVFile,
  detectEntityType,
  validateCSVData,
  mapCSVToProperties,
  mapCSVToTenants,
  mapCSVToTransactions,
  mapCSVToWorkOrders
} from '../utils/csvParser';

export const CSVMigration = ({
  onClose,
  onImport,
  properties = [],
  tenants = [],
  addProperty,
  addTenant,
  addTransaction,
  addWorkOrder
}) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Import
  const [csvFile, setCSVFile] = useState(null);
  const [csvData, setCSVData] = useState([]);
  const [entityType, setEntityType] = useState('properties');
  const [validationResult, setValidationResult] = useState({ valid: true, errors: [] });
  const [importResult, setImportResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setCSVFile(file);
    setIsProcessing(true);

    try {
      // Read and parse CSV
      const content = await readCSVFile(file);
      const parsed = parseCSV(content);

      // Detect entity type
      const headers = Object.keys(parsed[0] || {});
      const detectedType = detectEntityType(headers);
      setEntityType(detectedType);

      // Validate data
      const validation = validateCSVData(parsed, detectedType);
      setValidationResult(validation);

      setCSVData(parsed);
      setStep(2);
    } catch (error) {
      alert(`Error parsing CSV: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle entity type change
  const handleEntityTypeChange = (newType) => {
    setEntityType(newType);
    const validation = validateCSVData(csvData, newType);
    setValidationResult(validation);
  };

  // Handle import
  const handleImport = async () => {
    if (!validationResult.valid) {
      alert('Please fix validation errors before importing');
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      let mappedData = [];

      // Map data based on entity type
      switch (entityType) {
        case 'properties':
          mappedData = mapCSVToProperties(csvData);
          for (const item of mappedData) {
            try {
              await addProperty(item);
              successCount++;
            } catch (error) {
              console.error('Error adding property:', error);
              errorCount++;
            }
          }
          break;

        case 'tenants':
          mappedData = mapCSVToTenants(csvData);
          for (const item of mappedData) {
            try {
              await addTenant(item);
              successCount++;
            } catch (error) {
              console.error('Error adding tenant:', error);
              errorCount++;
            }
          }
          break;

        case 'transactions':
          mappedData = mapCSVToTransactions(csvData);
          for (const item of mappedData) {
            try {
              await addTransaction(item);
              successCount++;
            } catch (error) {
              console.error('Error adding transaction:', error);
              errorCount++;
            }
          }
          break;

        case 'workorders':
          mappedData = mapCSVToWorkOrders(csvData);
          for (const item of mappedData) {
            try {
              await addWorkOrder(item);
              successCount++;
            } catch (error) {
              console.error('Error adding work order:', error);
              errorCount++;
            }
          }
          break;

        default:
          alert('Unknown entity type. Please select a valid type.');
          setIsProcessing(false);
          return;
      }

      setImportResult({ successCount, errorCount, total: csvData.length });
      setStep(3);

      // Call onImport callback if provided
      if (onImport) {
        onImport({ entityType, successCount, errorCount });
      }
    } catch (error) {
      alert(`Error during import: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download sample CSV template
  const downloadTemplate = (type) => {
    const templates = {
      properties: 'name,address,type,units,occupied,monthlyRevenue,purchasePrice,purchaseDate,status\nSunset Apartments,123 Main St,Residential,10,8,8000,500000,2020-01-15,Active',
      tenants: 'name,email,phone,property,unit,rent,leaseStart,leaseEnd,status\nJohn Doe,john@example.com,555-1234,Sunset Apartments,101,1200,2023-01-01,2024-01-01,Current',
      transactions: 'type,amount,description,date,category,property,tenant,unit\nincome,1200,Monthly Rent Payment,2024-01-01,Rent,Sunset Apartments,John Doe,101',
      workorders: 'title,description,property,unit,tenant,priority,status,category,dateSubmitted\nFix Leaking Faucet,Kitchen faucet is leaking,Sunset Apartments,101,John Doe,Medium,Open,Plumbing,2024-01-15'
    };

    const content = templates[type] || templates.properties;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">CSV Data Migration</h3>
            <p className="text-sm text-gray-600 mt-1">
              Import properties, tenants, transactions, or work orders from CSV files
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
                <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Upload CSV File
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Select a CSV file to import data into AdminEstate
                </p>
                <label className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer inline-flex items-center transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose CSV File
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Templates */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Download Sample Templates</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['properties', 'tenants', 'transactions', 'workorders'].map(type => (
                    <button
                      key={type}
                      onClick={() => downloadTemplate(type)}
                      className="flex items-center justify-center px-4 py-2 bg-white rounded-lg hover:bg-blue-100 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4 mr-2 text-blue-600" />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">CSV Format Requirements</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• First row must contain column headers</li>
                  <li>• Use commas to separate values</li>
                  <li>• Enclose text with commas in double quotes</li>
                  <li>• Date format: YYYY-MM-DD</li>
                  <li>• Numeric values should not include currency symbols</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Entity Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Data Type
                </label>
                <select
                  value={entityType}
                  onChange={(e) => handleEntityTypeChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="properties">Properties</option>
                  <option value="tenants">Tenants</option>
                  <option value="transactions">Transactions</option>
                  <option value="workorders">Work Orders</option>
                </select>
              </div>

              {/* Validation Results */}
              {validationResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-900 mb-2">Validation Errors</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {validationResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {validationResult.valid && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <p className="text-green-800 font-medium">
                      CSV file is valid! Ready to import {csvData.length} record(s).
                    </p>
                  </div>
                </div>
              )}

              {/* Data Preview */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Data Preview (First 5 rows)</h4>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(csvData[0] || {}).map((header, index) => (
                          <th
                            key={index}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {csvData.slice(0, 5).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.values(row).map((value, colIndex) => (
                            <td
                              key={colIndex}
                              className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                            >
                              {value || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {csvData.length > 5 && (
                  <p className="text-sm text-gray-500 mt-2">
                    ...and {csvData.length - 5} more row(s)
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setStep(1);
                    setCSVFile(null);
                    setCSVData([]);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={!validationResult.valid || isProcessing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? 'Importing...' : `Import ${csvData.length} Record(s)`}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && importResult && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Import Completed!
                </h4>
                <p className="text-gray-600">
                  Your data has been successfully imported into AdminEstate.
                </p>
              </div>

              {/* Import Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{importResult.total}</p>
                  <p className="text-sm text-gray-600">Total Records</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{importResult.successCount}</p>
                  <p className="text-sm text-gray-600">Successful</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{importResult.errorCount}</p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-center">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
