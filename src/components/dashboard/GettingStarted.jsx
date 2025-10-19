import React from 'react';
import { Home, Plus, HelpCircle } from 'lucide-react';

export const GettingStarted = ({ openModal, setShowTips }) => {
  return (
    <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
      <div className="max-w-md mx-auto">
        <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Started with PropertyPro</h3>
        <p className="text-gray-600 mb-6">Add your first property to begin managing your real estate portfolio</p>
        <div className="space-y-3">
          <button 
            onClick={() => openModal('addProperty')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Property
          </button>
          <button 
            onClick={() => setShowTips(true)}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <HelpCircle className="w-5 h-5 mr-2" />
            Show Getting Started Tips
          </button>
        </div>
      </div>
    </div>
  );
};