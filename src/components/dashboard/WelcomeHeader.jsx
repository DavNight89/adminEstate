import React from 'react';
import { Lightbulb, X } from 'lucide-react';

export const WelcomeHeader = ({ hasProperties, showTips, setShowTips }) => {
  return (
    <>
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome! 👋</h2>
            <p className="text-blue-100">
              {!hasProperties
                ? "Start by adding your first property to get started"
                : "Here's what's happening with your properties today"
              }  
            </p>
          </div>

          <button
            onClick={() => setShowTips(!showTips)}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
          >
            <Lightbulb className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Quick Tips Panel */}
      {showTips && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">💡 Pro Tips</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Use the search bar to quickly find tenants, properties, or work orders</li>
                <li>• Click on metric cards to see detailed breakdowns</li>
                <li>• Set up automated rent reminders in the Communication section</li>
              </ul>
            </div>
            <button 
              onClick={() => setShowTips(false)}
              className="ml-auto text-amber-600 hover:text-amber-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};