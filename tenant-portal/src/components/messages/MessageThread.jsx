import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Reply, Mail } from 'lucide-react';

const MessageThread = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchMessages = async () => {
    if (!user?.tenant?.email) return;

    try {
      const response = await fetch(`http://localhost:5000/api/messages?tenantEmail=${user.tenant.email}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(data.data || []);
          if (!selectedMessage && data.data && data.data.length > 0) {
            setSelectedMessage(data.data[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await fetch(`http://localhost:5000/api/messages/${messageId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      // Update local state
      setMessages(messages.map(m => m.id === messageId ? { ...m, read: true } : m));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    if (!message.read) {
      markAsRead(message.id);
    }
  };

  const handleReply = () => {
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;

    setSending(true);
    try {
      const response = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: user.tenant.name,
          fromEmail: user.tenant.email,
          to: 'Property Manager',
          toEmail: 'manager@adminestate.com',
          property: user.tenant.property,
          unit: user.tenant.unit,
          subject: `RE: ${selectedMessage.subject}`,
          message: replyText,
          replyTo: selectedMessage.id
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowReplyModal(false);
        setReplyText('');
        await fetchMessages();
        alert('Reply sent successfully!');
      } else {
        alert(`Failed to send reply: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getMessageIcon = (message) => {
    if (message.type === 'maintenance_request') return '🔧';
    if (message.type === 'approval_notification') return '✅';
    if (message.from === user.tenant.name) return '📤';
    return '📨';
  };

  const unreadCount = messages.filter(m => !m.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">
          Communicate with your property manager
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {unreadCount} unread
            </span>
          )}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-gray-200">
          {/* Message List */}
          <div className="lg:col-span-1">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">All Messages</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No messages yet</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                    } ${!message.read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getMessageIcon(message)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium text-gray-900 truncate ${!message.read ? 'font-bold' : ''}`}>
                            {message.from === user.tenant.name ? `To: ${message.to}` : message.from}
                          </p>
                          {!message.read && (
                            <span className="flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate mt-0.5">{message.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">{message.date} • {message.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Details */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-3xl">{getMessageIcon(selectedMessage)}</span>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h2>
                      <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                        <span>From: {selectedMessage.from}</span>
                        <span>•</span>
                        <span>{selectedMessage.date} at {selectedMessage.time}</span>
                      </div>
                      {selectedMessage.property && (
                        <div className="text-xs text-gray-500 mt-1">
                          {selectedMessage.property} - Unit {selectedMessage.unit}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedMessage.from !== user.tenant.name && (
                    <button
                      onClick={handleReply}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                {/* Maintenance Request Details */}
                {selectedMessage.type === 'maintenance_request' && selectedMessage.maintenanceData && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Maintenance Request Details</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Category:</span>
                        <span className="ml-2 font-medium text-gray-900">{selectedMessage.maintenanceData.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Priority:</span>
                        <span className="ml-2 font-medium text-gray-900">{selectedMessage.maintenanceData.priority}</span>
                      </div>
                      {selectedMessage.maintenanceData.location && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Location:</span>
                          <span className="ml-2 font-medium text-gray-900">{selectedMessage.maintenanceData.location}</span>
                        </div>
                      )}
                      <div className="col-span-2">
                        <span className="text-gray-600">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          selectedMessage.status === 'approved' ? 'bg-green-100 text-green-800' :
                          selectedMessage.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedMessage.status === 'approved' ? 'Approved' :
                           selectedMessage.status === 'pending_approval' ? 'Pending Approval' :
                           selectedMessage.status}
                        </span>
                        {selectedMessage.workOrderId && (
                          <span className="ml-2 text-gray-600">
                            (Work Order #{selectedMessage.workOrderId})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reply Thread */}
                {messages.filter(m => m.replyTo === selectedMessage.id).length > 0 && (
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Replies</h3>
                    <div className="space-y-3">
                      {messages
                        .filter(m => m.replyTo === selectedMessage.id)
                        .map(reply => (
                          <div key={reply.id} className="pl-4 border-l-2 border-blue-500">
                            <div className="flex items-start space-x-2">
                              <span className="text-sm font-medium text-gray-900">{reply.from}</span>
                              <span className="text-xs text-gray-500">{reply.date} at {reply.time}</span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{reply.message}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full p-8 text-center">
                <div>
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Select a message to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Reply to: {selectedMessage?.subject}</h3>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyText('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sending}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Reply</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageThread;
