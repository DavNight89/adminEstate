import React, { useState } from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';

const DataTable = ({ data, columns, title, searchable = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item =>
        Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(term.toLowerCase())
        )
      );
      setFilteredData(filtered);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex space-x-2">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            )}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(item[column.key], item) : item[column.key]}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-900 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;