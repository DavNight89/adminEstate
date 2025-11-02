import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Send, Sparkles, FileText, Users, Building, DollarSign, Wrench, BarChart3, RotateCcw } from 'lucide-react';

export const HelpSupport = () => {
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: "Hi! I'm your AdminEstate support assistant. I can help you with:\n\n• Navigating features\n• Troubleshooting issues\n• CSV import/export\n• Understanding reports\n• Data management\n\nWhat can I help you with today?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Knowledge base
  const knowledgeBase = {
    'csv import': {
      keywords: ['csv', 'import', 'upload', 'bulk', 'data', 'file'],
      response: `**CSV Import Guide:**

1. **Navigate to Documents** tab
2. Click **"Import CSV"** button
3. Select your CSV file

**Supported Formats:**
• Properties: name, address, type, units, purchasePrice, purchaseDate, status
• Tenants: name, email, phone, property, unit, rent, leaseEnd, status, balance

**Tips:**
✓ Property names must match exactly between files
✓ Use comma-separated values
✓ Include headers in first row
✓ Dates in YYYY-MM-DD format

Need a sample file? Check the backend-python/archive/dataframe_data/ folder.`
    },
    'tenant screening': {
      keywords: ['screening', 'application', 'tenant', 'approve', 'reject', 'risk'],
      response: `**Tenant Screening Process:**

**6-Step Application Flow:**
1. **Personal Info** - Basic tenant details
2. **Employment** - Income verification (3x rent rule)
3. **Rental History** - Previous landlords
4. **References** - Character references
5. **Background** - Credit & criminal checks
6. **Review** - Final decision

**Risk Scoring (0-100):**
• 80-100: Low risk (Auto-approve suggested)
• 60-79: Medium risk (Manual review)
• 0-59: High risk (Decline suggested)

**Actions:**
• View applications in **Applications** tab
• Change status anytime via dropdown
• Delete applications with confirmation`
    },
    'financial tracking': {
      keywords: ['financial', 'money', 'income', 'expense', 'transaction', 'rent', 'payment'],
      response: `**Financial Management:**

**Track Income:**
• Rent payments
• Late fees
• Other income
• Auto-calculate totals

**Track Expenses:**
• Maintenance costs
• Utilities
• Property taxes
• Insurance

**Features:**
✓ Real-time balance tracking
✓ CSV/Excel export
✓ Tax-ready reports
✓ Property-level P&L
✓ Portfolio overview

Access via **Financial** tab in sidebar.`
    },
    'work orders': {
      keywords: ['work order', 'maintenance', 'repair', 'fix', 'broken', 'issue'],
      response: `**Work Order Management:**

**Create Work Orders:**
1. Go to **Work Orders** tab
2. Click "New Work Order"
3. Select property & tenant
4. Set priority (Low/Medium/High/Emergency)
5. Assign vendor (optional)
6. Track costs

**Status Tracking:**
• Pending
• In Progress
• Completed
• Cancelled

**Best Practices:**
✓ Use priority levels appropriately
✓ Document costs for tax records
✓ Update status regularly
✓ Keep tenants informed`
    },
    'analytics': {
      keywords: ['analytics', 'report', 'insight', 'metric', 'occupancy', 'performance'],
      response: `**Analytics & Reports:**

**Available Metrics:**
• **Occupancy Rate** - Filled vs vacant units
• **Revenue** - Income trends
• **Expenses** - Cost analysis
• **ROI** - Return on investment
• **Cap Rate** - Property performance

**Data Export:**
• CSV format for Excel
• Custom date ranges
• Property-specific reports
• Portfolio summaries

**Powered by:**
Python Pandas for advanced analytics - superior to JavaScript alternatives!

Find in **Analytics** and **Reports** tabs.`
    },
    'data backup': {
      keywords: ['backup', 'export', 'save', 'data', 'lost', 'recover'],
      response: `**Data Management:**

**Your Data Storage:**
• Stored locally in browser (IndexedDB)
• No cloud dependency
• Complete privacy
• Works offline

**Backup Methods:**
1. **CSV Export** (Documents tab)
   • Export properties
   • Export tenants
   • Export transactions

2. **Browser Data**
   • LocalStorage backup
   • Automatic saves

**Recovery:**
• Import CSV files to restore
• No data sent to servers
• You own 100% of your data

**Best Practice:**
Export CSV files monthly for backup!`
    },
    'offline mode': {
      keywords: ['offline', 'internet', 'connection', 'local', 'work without'],
      response: `**Offline-First Architecture:**

**How It Works:**
✓ All data stored locally
✓ No internet required
✓ Works on airplane mode
✓ Instant performance

**Local Storage:**
• IndexedDB for large data
• LocalStorage for settings
• No external dependencies

**Benefits:**
• Lightning fast
• Complete privacy
• No subscription fees
• Your data stays on your device

**Sync:**
Currently standalone. Future updates may add optional cloud sync while maintaining offline-first approach.`
    },
    'delete': {
      keywords: ['delete', 'remove', 'erase', 'undo'],
      response: `**Deleting Items:**

**Applications:**
• Click trash icon on application
• Confirm deletion
• Permanent removal

**Tenants:**
• Navigate to tenant details
• Click delete button
• Cannot recover after deletion

**Properties:**
• Must remove all tenants first
• Then delete property
• Protects data integrity

**Documents:**
• Click trash icon in Documents tab
• Immediate removal

**⚠️ Important:**
Deletions are permanent in offline mode. Export CSV backups regularly!`
    },
    'features': {
      keywords: ['features', 'what can', 'capabilities', 'functions', 'do'],
      response: `**AdminEstate Features:**

**Core:**
🏢 Property Management - Unlimited properties
👥 Tenant Tracking - Complete tenant records
📋 Application Screening - 6-step process with risk scoring
💰 Financial Tracking - Income/expenses
🔧 Work Orders - Maintenance management

**Intelligence:**
📊 Analytics - Advanced insights (Pandas-powered)
📈 Reports - Tax-ready exports
📄 Documents - File management

**Data:**
📥 CSV Import/Export - Bulk operations
🔒 Offline-First - Your data, your device
💾 Auto-Save - Never lose work

**Free Forever:**
$0 cost, no subscriptions, no limits!`
    }
  };

  const quickActions = [
    { icon: FileText, label: 'CSV Import Guide', query: 'How do I import CSV files?' },
    { icon: Users, label: 'Tenant Screening', query: 'How does tenant screening work?' },
    { icon: Building, label: 'Property Setup', query: 'How do I add a new property?' },
    { icon: DollarSign, label: 'Financial Tracking', query: 'How do I track finances?' },
    { icon: Wrench, label: 'Work Orders', query: 'How do work orders work?' },
    { icon: BarChart3, label: 'Analytics', query: 'What analytics are available?' }
  ];

  const findBestMatch = (query) => {
    const lowerQuery = query.toLowerCase();

    // Find exact or partial matches
    for (const [key, data] of Object.entries(knowledgeBase)) {
      if (data.keywords.some(keyword => lowerQuery.includes(keyword))) {
        return data.response;
      }
    }

    // No match found
    return `I'm not sure about that specific question. Here's what I can help with:

**Topics I Cover:**
• CSV Import/Export
• Tenant Screening & Applications
• Financial Tracking
• Work Orders & Maintenance
• Analytics & Reports
• Data Backup & Recovery
• Offline Mode
• Feature Overview

Try asking about one of these topics, or use the quick action buttons below!`;
  };

  const handleSend = (message = inputValue) => {
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: message }]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = findBestMatch(message);
      setMessages(prev => [...prev, { type: 'assistant', content: response }]);
      setIsTyping(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        type: 'assistant',
        content: "Hi! I'm your AdminEstate support assistant. I can help you with:\n\n• Navigating features\n• Troubleshooting issues\n• CSV import/export\n• Understanding reports\n• Data management\n\nWhat can I help you with today?"
      }
    ]);
    setInputValue('');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <HelpCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Help & Support</h2>
            <p className="text-gray-600">AI-powered assistance for AdminEstate</p>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl px-4 py-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {message.content}
              </pre>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-3xl px-4 py-3 rounded-lg bg-white border border-gray-200">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="px-6 py-4 bg-white border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">Quick Actions:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleSend(action.query)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
              >
                <action.icon className="w-4 h-4 text-gray-500" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me anything about AdminEstate..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {messages.length > 2 && (
            <button
              onClick={handleReset}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
              title="Start a new question"
            >
              <RotateCcw className="w-4 h-4" />
              New Question
            </button>
          )}
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: Try asking about CSV imports, tenant screening, or any AdminEstate feature!
        </p>
      </div>
    </div>
  );
};
