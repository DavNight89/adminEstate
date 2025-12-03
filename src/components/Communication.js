import React, { useState, useEffect } from 'react';
import {
  Plus,
  Bell,
  Calendar,
  AlertTriangle,
  MessageSquare,
  Wrench,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const Communication = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [newMessage, setNewMessage] = useState({ tenantEmail: '', subject: '', message: '' });
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [tenants, setTenants] = useState([]);
  // OFFLINE-ONLY: No backend tracking needed
  const selectedMessageIdRef = React.useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    selectedMessageIdRef.current = selectedMessage?.id || null;
  }, [selectedMessage]);

  // OFFLINE-ONLY: Load messages from localStorage only
  const fetchMessages = React.useCallback(async () => {
    try {
      const localMessages = localStorage.getItem('messages');
      if (localMessages) {
        const parsedMessages = JSON.parse(localMessages);
        setMessages(parsedMessages);

        // If a message is currently selected, update it with fresh data
        const currentSelectedId = selectedMessageIdRef.current;
        if (currentSelectedId) {
          const updatedSelectedMessage = parsedMessages.find(m => m.id === currentSelectedId);
          if (updatedSelectedMessage) {
            setSelectedMessage(updatedSelectedMessage);
          }
        } else if (parsedMessages.length > 0) {
          // If no message is selected, select the first one
          setSelectedMessage(parsedMessages[0]);
        }
        console.log(`✅ Messages loaded from localStorage (${parsedMessages.length})`);
      } else {
        // No messages in localStorage
        setMessages([]);
        console.log('✅ Messages initialized from fallback data');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // OFFLINE-ONLY: No polling intervals
  useEffect(() => {
    fetchMessages();
    fetchTenants();
  }, [fetchMessages]);

  // OFFLINE-ONLY: Load tenants from localStorage only
  const fetchTenants = async () => {
    try {
      const localTenants = localStorage.getItem('tenants');
      if (localTenants) {
        const parsedTenants = JSON.parse(localTenants);
        setTenants(parsedTenants);
        console.log(`✅ Tenants loaded from localStorage (${parsedTenants.length})`);
      } else {
        setTenants([]);
        console.log('✅ Tenants initialized from fallback data');
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const handleApproveMaintenanceRequest = async (messageId) => {
    if (!window.confirm('Approve this maintenance request and create a work order?')) {
      return;
    }

    setApproving(true);
    try {
      // OFFLINE-ONLY: Create work order in localStorage
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      // Create work order
      const workOrderId = Date.now();
      const workOrder = {
        id: workOrderId,
        title: message.subject,
        description: message.message,
        status: 'Open',
        priority: message.maintenanceData?.priority || 'normal',
        category: message.maintenanceData?.category || 'General',
        property: message.property,
        unit: message.unit,
        tenant: message.from,
        tenantEmail: message.fromEmail,
        dateSubmitted: new Date().toISOString().split('T')[0]
      };

      // Save work order to localStorage
      const localWorkOrders = localStorage.getItem('workOrders');
      const workOrders = localWorkOrders ? JSON.parse(localWorkOrders) : [];
      workOrders.push(workOrder);
      localStorage.setItem('workOrders', JSON.stringify(workOrders));

      // Update message status
      const updatedMessages = messages.map(m =>
        m.id === messageId ? { ...m, status: 'approved', workOrderId } : m
      );
      localStorage.setItem('messages', JSON.stringify(updatedMessages));
      setMessages(updatedMessages);
      setSelectedMessage({ ...message, status: 'approved', workOrderId });

      alert(`✓ Maintenance request approved! Work Order #${workOrderId} created.`);
    } catch (error) {
      console.error('Error approving maintenance request:', error);
      alert('Error approving request. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  const getMessageInitials = (from) => {
    if (!from) return '??';
    const names = from.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getMessageGradient = (index) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-blue-500',
      'from-purple-500 to-pink-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-pink-500'
    ];
    return gradients[index % gradients.length];
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleSendNewMessage = async () => {
    if (!newMessage.tenantEmail || !newMessage.subject.trim() || !newMessage.message.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      const selectedTenant = tenants.find(t => t.email === newMessage.tenantEmail);
      if (!selectedTenant) {
        alert('Tenant not found');
        setSending(false);
        return;
      }

      // OFFLINE-ONLY: Save message to localStorage
      const newMessageData = {
        id: Date.now(),
        from: 'Property Manager',
        fromEmail: 'manager@adminestate.com',
        to: selectedTenant.name,
        toEmail: selectedTenant.email,
        property: selectedTenant.property,
        unit: selectedTenant.unit,
        subject: newMessage.subject,
        message: newMessage.message,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        submittedAt: new Date().toISOString(),
        read: false,
        type: 'general'
      };

      const localMessages = localStorage.getItem('messages');
      const messagesArray = localMessages ? JSON.parse(localMessages) : [];
      messagesArray.unshift(newMessageData);
      localStorage.setItem('messages', JSON.stringify(messagesArray));

      setMessages(messagesArray);
      setShowNewMessageModal(false);
      setNewMessage({ tenantEmail: '', subject: '', message: '' });
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;

    setSending(true);
    try {
      // OFFLINE-ONLY: Save reply to localStorage
      const replyMessage = {
        id: Date.now(),
        from: 'Property Manager',
        fromEmail: 'manager@adminestate.com',
        to: selectedMessage.from,
        toEmail: selectedMessage.fromEmail,
        property: selectedMessage.property,
        unit: selectedMessage.unit,
        subject: `RE: ${selectedMessage.subject}`,
        message: replyText,
        replyTo: selectedMessage.id,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        submittedAt: new Date().toISOString(),
        read: false,
        type: 'reply'
      };

      const localMessages = localStorage.getItem('messages');
      const messagesArray = localMessages ? JSON.parse(localMessages) : [];
      messagesArray.unshift(replyMessage);
      localStorage.setItem('messages', JSON.stringify(messagesArray));

      setMessages(messagesArray);
      setReplyText('');
      alert('Reply sent successfully!');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Error sending reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const markAsRead = (messageId) => {
    // OFFLINE-ONLY: Update read status in localStorage
    try {
      const updatedMessages = messages.map(m => m.id === messageId ? { ...m, read: true } : m);
      localStorage.setItem('messages', JSON.stringify(updatedMessages));
      setMessages(updatedMessages);
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

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Communication Center
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                {unreadCount} unread
              </span>
            )}
          </h2>
          <p className="text-gray-600">Stay connected with your tenants</p>
        </div>
        <button
          onClick={() => setShowNewMessageModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
        >
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
          <div className="space-y-0 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Loading...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No messages yet</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${getMessageGradient(index)} rounded-full flex items-center justify-center text-white font-medium text-sm relative`}>
                      {message.type === 'maintenance_request' && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <Wrench className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {getMessageInitials(message.from)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{message.from}</p>
                        {message.type === 'maintenance_request' && message.status === 'pending_approval' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-medium">
                            Pending
                          </span>
                        )}
                        {message.type === 'maintenance_request' && message.status === 'approved' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">
                            Approved
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{message.subject || message.message}</p>
                      <p className="text-xs text-gray-400">{formatTimeAgo(message.submittedAt || message.date)}</p>
                    </div>
                    {!message.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          {selectedMessage ? (
            <>
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {selectedMessage.from} - {selectedMessage.unit}
                      {selectedMessage.type === 'maintenance_request' && (
                        <Wrench className="w-4 h-4 text-orange-600" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedMessage.property}</p>
                    <p className="text-sm font-medium text-gray-900 mt-2">{selectedMessage.subject}</p>
                  </div>
                  {selectedMessage.type === 'maintenance_request' && selectedMessage.status === 'pending_approval' && (
                    <button
                      onClick={() => handleApproveMaintenanceRequest(selectedMessage.id)}
                      disabled={approving}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {approving ? 'Approving...' : 'Approve & Create Work Order'}
                    </button>
                  )}
                  {selectedMessage.type === 'maintenance_request' && selectedMessage.status === 'approved' && selectedMessage.workOrderId && (
                    <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Work Order #{selectedMessage.workOrderId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 p-4 space-y-4 max-h-96 overflow-y-auto">
                {/* Original Message */}
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 p-4 rounded-lg max-w-xl">
                    <p className="text-sm font-medium mb-2">{selectedMessage.subject}</p>
                    <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>

                    {/* Maintenance Request Details */}
                    {selectedMessage.type === 'maintenance_request' && selectedMessage.maintenanceData && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                        <div className="flex gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            selectedMessage.maintenanceData.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            selectedMessage.maintenanceData.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {selectedMessage.maintenanceData.priority} Priority
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-800">
                            {selectedMessage.maintenanceData.category}
                          </span>
                        </div>
                        {selectedMessage.maintenanceData.location && (
                          <p className="text-xs text-gray-600">
                            <strong>Location:</strong> {selectedMessage.maintenanceData.location}
                          </p>
                        )}
                        {selectedMessage.maintenanceData.preferredTime && (
                          <p className="text-xs text-gray-600">
                            <strong>Preferred Time:</strong> {selectedMessage.maintenanceData.preferredTime}
                          </p>
                        )}
                        {selectedMessage.maintenanceData.accessInstructions && (
                          <p className="text-xs text-gray-600">
                            <strong>Access Instructions:</strong> {selectedMessage.maintenanceData.accessInstructions}
                          </p>
                        )}
                        {selectedMessage.maintenanceData.photos && selectedMessage.maintenanceData.photos.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-600 mb-2"><strong>Photos:</strong></p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {selectedMessage.maintenanceData.photos.map((photoPath, idx) => (
                                <img
                                  key={idx}
                                  src={`http://localhost:5000${photoPath}`}
                                  alt={`Maintenance photo ${idx + 1}`}
                                  className="w-full h-24 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-75 transition-opacity"
                                  onClick={() => window.open(`http://localhost:5000${photoPath}`, '_blank')}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      {selectedMessage.time} • {selectedMessage.date}
                    </p>
                  </div>
                </div>

                {/* Approval notification if approved */}
                {selectedMessage.status === 'approved' && (
                  <div className="flex justify-end">
                    <div className="bg-green-600 text-white p-3 rounded-lg max-w-xl">
                      <p className="text-sm">
                        ✓ Approved and converted to Work Order #{selectedMessage.workOrderId}. We will address this issue as soon as possible.
                      </p>
                      <p className="text-xs opacity-75 mt-1">{selectedMessage.time}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                    placeholder="Type your reply..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Select a message to view</p>
              </div>
            </div>
          )}
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

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Send New Message</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Tenant
                  </label>
                  <select
                    value={newMessage.tenantEmail}
                    onChange={(e) => setNewMessage({ ...newMessage, tenantEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a tenant...</option>
                    {tenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.email}>
                        {tenant.name} - {tenant.property}, Unit {tenant.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                    placeholder="Enter message subject..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={newMessage.message}
                    onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                    placeholder="Type your message..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowNewMessageModal(false);
                    setNewMessage({ tenantEmail: '', subject: '', message: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNewMessage}
                  disabled={!newMessage.tenantEmail || !newMessage.subject.trim() || !newMessage.message.trim() || sending}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Message</span>
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
