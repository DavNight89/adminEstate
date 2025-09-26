import React from 'react';
import { 
  Plus, 
  Bell, 
  Calendar, 
  AlertTriangle, 
  MessageSquare 
} from 'lucide-react';

export const Communication = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Communication Center</h2>
          <p className="text-gray-600">Stay connected with your tenants</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold">Recent Messages</h3>
          </div>
          <div className="space-y-0">
            <div className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  JS
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">John Smith</p>
                  <p className="text-sm text-gray-500 truncate">Thank you for fixing the...</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
            <div className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  SJ
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                  <p className="text-sm text-gray-500 truncate">When can someone look at...</p>
                  <p className="text-xs text-gray-400">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold">John Smith - Unit A101</h3>
            <p className="text-sm text-gray-600">Sunset Apartments</p>
          </div>
          
          <div className="flex-1 p-4 space-y-4 max-h-96 overflow-y-auto">
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white p-3 rounded-lg max-w-xs">
                <p className="text-sm">Hi John, we've scheduled the plumber for tomorrow morning. Thanks for your patience!</p>
                <p className="text-xs opacity-75 mt-1">2:30 PM</p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-900 p-3 rounded-lg max-w-xs">
                <p className="text-sm">Thank you for fixing the faucet so quickly! Everything is working perfectly now.</p>
                <p className="text-xs opacity-75 mt-1">4:15 PM</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Communication */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">Bulk Communication Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors group">
            <Bell className="w-6 h-6 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium">Rent Reminder</p>
            <p className="text-xs text-gray-500 mt-1">Send payment reminders</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors group">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium">Lease Renewal</p>
            <p className="text-xs text-gray-500 mt-1">Renewal notifications</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors group">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-yellow-600 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium">Emergency Alert</p>
            <p className="text-xs text-gray-500 mt-1">Urgent notifications</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors group">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium">General Notice</p>
            <p className="text-xs text-gray-500 mt-1">Community updates</p>
          </button>
        </div>
      </div>
    </div>
  );