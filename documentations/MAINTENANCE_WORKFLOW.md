# Hybrid Maintenance Request Workflow
## AdminEstate Tenant Portal Integration

**Date**: November 8, 2025
**Status**: Production Ready
**Version**: 1.0

---

## Overview

AdminEstate implements a **hybrid maintenance request workflow** that provides a balance between tenant self-service and property manager oversight. Unlike traditional systems where tenant requests immediately create work orders, this system creates **messages for manager approval** first.

### Key Benefits

✅ **Manager Oversight** - All requests reviewed before becoming work orders
✅ **Spam Prevention** - Filters out duplicate or invalid requests
✅ **Priority Control** - Manager can adjust priority/category before approval
✅ **Cost Control** - Prevents unnecessary work order creation
✅ **Tenant Empowerment** - Self-service portal with photo uploads
✅ **Audit Trail** - Complete history from request → message → work order

---

## Architecture

### System Components

```
┌─────────────────────┐         ┌──────────────────────┐         ┌────────────────────┐
│  Tenant Portal      │         │  Flask Backend       │         │  AdminEstate       │
│  (Port 3003)        │────────▶│  (Port 5000)         │◀────────│  (Port 3000)       │
│  React App          │         │  Python/Flask        │         │  React App         │
└─────────────────────┘         └──────────────────────┘         └────────────────────┘
        │                                  │                               │
        │                                  ▼                               │
        │                         ┌─────────────────┐                     │
        └────────────────────────▶│   data.json     │◀────────────────────┘
                                  │  File Storage   │
                                  │  /uploads/      │
                                  └─────────────────┘
```

### Data Flow

1. **Tenant Submission** (Tenant Portal)
   - Tenant fills maintenance request form
   - Uploads photos (optional)
   - Submits via `POST /api/tenant/maintenance`

2. **Backend Processing** (Flask)
   - Photos uploaded to `/uploads/maintenance/`
   - Creates message object with `type: 'maintenance_request'`
   - Stores in `data.json` messages array
   - Returns success response

3. **Manager Review** (AdminEstate Communication Center)
   - Auto-polls `/api/messages` every 5 seconds
   - Displays pending requests with 🔧 icon
   - Manager views details including photos
   - Clicks "Approve & Create Work Order"

4. **Work Order Creation** (Flask Backend)
   - `POST /api/maintenance/approve/{message_id}`
   - Creates work order from message data
   - Updates message status to 'approved'
   - Links message to work order via IDs
   - Sends notification message to tenant

---

## Technical Implementation

### Frontend (Tenant Portal)

**File**: `tenant-portal/src/components/maintenance/MaintenanceRequestForm.jsx`

#### Photo Upload Process

```javascript
// 1. User selects photos
const handleFileSelect = async (e) => {
  const files = Array.from(e.target.files);

  // 2. Upload each photo to backend
  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch('http://localhost:5000/api/upload/photo', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    // 3. Store path (not base64!)
    return {
      path: result.data.path,  // e.g., "/uploads/maintenance/1762622805549_photo.jpg"
      filename: result.data.filename,
      originalName: result.data.originalName,
      preview: `http://localhost:5000${result.data.path}`
    };
  });

  const uploadedPhotos = await Promise.all(uploadPromises);
  setFormData({ ...formData, photos: [...formData.photos, ...uploadedPhotos] });
};
```

#### Request Submission

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  const requestData = {
    title: formData.title,
    description: formData.description,
    category: formData.category,
    priority: formData.priority,
    location: formData.location,
    accessInstructions: formData.accessInstructions,
    preferredTime: formData.preferredTime,
    photos: formData.photos.map(photo => photo.path),  // Only paths!
    tenantName: user?.tenant?.name,
    tenantEmail: user?.tenant?.email,
    unit: user?.tenant?.unit,
    property: user?.tenant?.property
  };

  const response = await fetch('http://localhost:5000/api/tenant/maintenance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  });
};
```

### Backend (Flask)

**File**: `backend-python/app_simple.py`

#### Photo Upload Endpoint

```python
@app.route('/api/upload/photo', methods=['POST'])
def upload_photo():
    """Upload a photo and return the file path"""
    file = request.files['photo']

    # Validate file type
    if not allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS):
        return jsonify({'success': False, 'error': 'Invalid file type'}), 400

    # Generate unique filename
    timestamp = int(datetime.now().timestamp() * 1000)
    safe_filename = secure_filename(f"{timestamp}_{file.filename}")

    # Save to /uploads/maintenance/
    file_path = MAINTENANCE_UPLOAD_FOLDER / safe_filename
    file.save(str(file_path))

    # Return path for data.json storage
    relative_path = f"/uploads/maintenance/{safe_filename}"

    return jsonify({
        'success': True,
        'data': {
            'path': relative_path,
            'filename': safe_filename,
            'originalName': file.filename
        }
    }), 201
```

#### Maintenance Request Endpoint

```python
@app.route('/api/tenant/maintenance', methods=['POST'])
def tenant_submit_maintenance():
    """Tenant submits a maintenance request - creates message with metadata for approval"""
    data = read_data()
    maintenance_request = request.json

    # Create MESSAGE (not work order!)
    message_id = int(datetime.now().timestamp() * 1000)
    new_message = {
        'id': message_id,
        'from': maintenance_request.get('tenantName', 'Tenant'),
        'fromEmail': maintenance_request.get('tenantEmail', ''),
        'property': maintenance_request.get('property'),
        'unit': maintenance_request.get('unit'),
        'subject': f"Maintenance Request: {maintenance_request.get('title')}",
        'message': maintenance_request.get('description'),
        'date': datetime.now().strftime('%Y-%m-%d'),
        'time': datetime.now().strftime('%I:%M %p'),
        'read': False,
        'type': 'maintenance_request',  # Special message type
        'status': 'pending_approval',   # Awaiting manager
        'maintenanceData': {
            'title': maintenance_request.get('title'),
            'category': maintenance_request.get('category'),
            'priority': maintenance_request.get('priority'),
            'location': maintenance_request.get('location'),
            'accessInstructions': maintenance_request.get('accessInstructions'),
            'preferredTime': maintenance_request.get('preferredTime'),
            'photos': maintenance_request.get('photos', [])  # Array of paths
        },
        'workOrderId': None,  # Set when approved
        'submittedAt': datetime.now().isoformat()
    }

    data['messages'].append(new_message)
    write_data(data)

    return jsonify({
        'success': True,
        'data': new_message,
        'message': 'Maintenance request submitted and sent to property manager for review'
    }), 201
```

#### Approval Endpoint

```python
@app.route('/api/maintenance/approve/<int:message_id>', methods=['POST'])
def approve_maintenance_request(message_id):
    """Approve a maintenance request message and convert it to a work order"""
    data = read_data()
    messages = data.get('messages', [])

    # Find the maintenance request message
    message = next((msg for msg in messages if msg.get('id') == message_id
                   and msg.get('type') == 'maintenance_request'), None)

    if not message:
        return jsonify({'success': False, 'error': 'Maintenance request not found'}), 404

    if message.get('status') == 'approved':
        return jsonify({'success': False, 'error': 'Request already approved'}), 400

    # Create work order from maintenance request
    maintenance_data = message.get('maintenanceData', {})
    work_order_id = int(datetime.now().timestamp() * 1000)

    new_work_order = {
        'id': work_order_id,
        'property': message.get('property'),
        'tenant': message.get('from'),
        'unit': message.get('unit'),
        'issue': maintenance_data.get('title'),
        'description': message.get('message'),
        'category': maintenance_data.get('category'),
        'priority': maintenance_data.get('priority'),
        'status': 'Pending',
        'date': datetime.now().strftime('%Y-%m-%d'),
        'location': maintenance_data.get('location'),
        'accessInstructions': maintenance_data.get('accessInstructions'),
        'preferredTime': maintenance_data.get('preferredTime'),
        'photos': maintenance_data.get('photos', []),
        'source': 'tenant_portal',  # Track origin
        'messageId': message_id,     # Link back to message
        'submittedAt': message.get('submittedAt'),
        'approvedAt': datetime.now().isoformat(),
        'updatedAt': datetime.now().isoformat()
    }

    data['workOrders'].append(new_work_order)

    # Update message status
    message['status'] = 'approved'
    message['workOrderId'] = work_order_id
    message['approvedAt'] = datetime.now().isoformat()

    # Create notification message for tenant
    notification_message = {
        'id': work_order_id + 1,
        'from': 'Property Manager',
        'fromEmail': 'manager@adminestate.com',
        'to': message.get('from'),
        'property': message.get('property'),
        'unit': message.get('unit'),
        'subject': f"RE: {message.get('subject')}",
        'message': f"Your maintenance request has been approved and converted to Work Order #{work_order_id}. We will address this issue as soon as possible.",
        'date': datetime.now().strftime('%Y-%m-%d'),
        'time': datetime.now().strftime('%I:%M %p'),
        'read': False,
        'type': 'approval_notification',
        'workOrderId': work_order_id,
        'replyTo': message_id
    }

    data['messages'].append(notification_message)
    write_data(data)

    return jsonify({
        'success': True,
        'data': {
            'workOrder': new_work_order,
            'notification': notification_message
        },
        'message': f'Maintenance request approved and Work Order #{work_order_id} created'
    })
```

### Frontend (AdminEstate)

**File**: `src/components/Communication.js`

#### Auto-Refresh with Preserved Selection

```javascript
const [messages, setMessages] = useState([]);
const [selectedMessage, setSelectedMessage] = useState(null);
const selectedMessageIdRef = React.useRef(null);

// Keep ref in sync with state
useEffect(() => {
  selectedMessageIdRef.current = selectedMessage?.id || null;
}, [selectedMessage]);

// Fetch messages with preserved selection
const fetchMessages = React.useCallback(async () => {
  const response = await fetch('http://localhost:5000/api/messages');
  const data = await response.json();

  if (data.success) {
    const newMessages = data.data || [];
    setMessages(newMessages);

    // Preserve selection across refresh
    const currentSelectedId = selectedMessageIdRef.current;
    if (currentSelectedId) {
      const updatedSelectedMessage = newMessages.find(m => m.id === currentSelectedId);
      if (updatedSelectedMessage) {
        setSelectedMessage(updatedSelectedMessage);
      }
    } else if (newMessages.length > 0) {
      setSelectedMessage(newMessages[0]);
    }
  }
}, []);

// Poll every 5 seconds
useEffect(() => {
  fetchMessages();
  const interval = setInterval(fetchMessages, 5000);
  return () => clearInterval(interval);
}, [fetchMessages]);
```

#### Approval Handler

```javascript
const handleApproveMaintenanceRequest = async (messageId) => {
  if (!window.confirm('Approve this maintenance request and create a work order?')) {
    return;
  }

  setApproving(true);
  try {
    const response = await fetch(`http://localhost:5000/api/maintenance/approve/${messageId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert(`✓ Maintenance request approved! Work Order #${data.data.workOrder.id} created.`);
      await fetchMessages();  // Refresh to show updated status
    }
  } catch (error) {
    console.error('Error approving:', error);
    alert('Network error. Please try again.');
  } finally {
    setApproving(false);
  }
};
```

---

## Data Structure

### Message Object (Pending)

```json
{
  "id": 1762622829275,
  "from": "John Doe",
  "fromEmail": "john@example.com",
  "property": "Sunset Apartments",
  "unit": "A101",
  "subject": "Maintenance Request: Leaky faucet",
  "message": "Kitchen sink faucet has been dripping for 2 days",
  "date": "2025-11-08",
  "time": "11:27 AM",
  "read": false,
  "type": "maintenance_request",
  "status": "pending_approval",
  "maintenanceData": {
    "title": "Leaky faucet",
    "category": "plumbing",
    "priority": "normal",
    "location": "Kitchen sink",
    "accessInstructions": "Key with building manager",
    "preferredTime": "morning",
    "photos": [
      "/uploads/maintenance/1762622805549_faucet.jpg"
    ]
  },
  "workOrderId": null,
  "submittedAt": "2025-11-08T11:27:09.279702"
}
```

### Message Object (Approved)

```json
{
  "id": 1762622829275,
  "from": "John Doe",
  "fromEmail": "john@example.com",
  "property": "Sunset Apartments",
  "unit": "A101",
  "subject": "Maintenance Request: Leaky faucet",
  "message": "Kitchen sink faucet has been dripping for 2 days",
  "date": "2025-11-08",
  "time": "11:27 AM",
  "read": false,
  "type": "maintenance_request",
  "status": "approved",  // ✅ Status changed
  "maintenanceData": { /* same as above */ },
  "workOrderId": 1762622856797,  // ✅ Linked to work order
  "submittedAt": "2025-11-08T11:27:09.279702",
  "approvedAt": "2025-11-08T11:27:36.798939"  // ✅ Approval timestamp
}
```

### Work Order Object

```json
{
  "id": 1762622856797,
  "property": "Sunset Apartments",
  "tenant": "John Doe",
  "unit": "A101",
  "issue": "Leaky faucet",
  "description": "Kitchen sink faucet has been dripping for 2 days",
  "category": "plumbing",
  "priority": "normal",
  "status": "Pending",
  "date": "2025-11-08",
  "location": "Kitchen sink",
  "accessInstructions": "Key with building manager",
  "preferredTime": "morning",
  "photos": [
    "/uploads/maintenance/1762622805549_faucet.jpg"
  ],
  "source": "tenant_portal",  // ✅ Tracks origin
  "messageId": 1762622829275,  // ✅ Links to original message
  "submittedAt": "2025-11-08T11:27:09.279702",
  "approvedAt": "2025-11-08T11:27:36.798907",
  "updatedAt": "2025-11-08T11:27:36.798918"
}
```

---

## File Storage Architecture

### Why File Paths Instead of Base64?

**Problem with Base64:**
- 2MB image → 2.7MB base64 string → stored in JSON
- 5 photos = 13.5MB JSON file
- Causes performance issues, corruption risk, memory problems

**Solution with File Storage:**
- Photos stored in `/backend-python/uploads/maintenance/`
- Only path stored in JSON: `"/uploads/maintenance/1762622805549_photo.jpg"`
- data.json stays small (~6KB instead of 5.5MB)
- Files served via HTTP: `GET http://localhost:5000/uploads/maintenance/filename.jpg`

### Upload Directory Structure

```
backend-python/
└── uploads/
    ├── maintenance/          # Tenant portal photos
    │   ├── 1762622805549_leak.jpg
    │   ├── 1762623456789_broken_window.png
    │   └── ...
    └── documents/            # Admin documents
        ├── 1762560346405_lease.pdf
        ├── 1762561234567_invoice.xlsx
        └── ...
```

### File Naming Convention

Format: `{timestamp}_{original_filename}`

Example: `1762622805549_photo.jpg`

- **Timestamp**: Milliseconds since epoch (unique)
- **Original filename**: Sanitized with `secure_filename()`
- **Benefits**: No collisions, chronological sorting, preserves original name

---

## API Endpoints Reference

### Tenant Portal Endpoints

| Endpoint | Method | Purpose | Request Body | Response |
|----------|--------|---------|--------------|----------|
| `/api/upload/photo` | POST | Upload photo | FormData with `photo` file | `{path, filename, originalName}` |
| `/api/tenant/maintenance` | POST | Submit maintenance request | JSON with request details + photo paths | `{success, data: message_object}` |
| `/api/tenant/maintenance` | GET | Get tenant's requests | Query: `?tenantEmail=...` | `{success, data: [messages]}` |
| `/uploads/maintenance/{filename}` | GET | Serve uploaded photo | - | Image file |

### AdminEstate Endpoints

| Endpoint | Method | Purpose | Request Body | Response |
|----------|--------|---------|--------------|----------|
| `/api/messages` | GET | Get all messages | - | `{success, data: [messages], count}` |
| `/api/maintenance/approve/{id}` | POST | Approve request → work order | - | `{success, data: {workOrder, notification}}` |
| `/api/upload/document` | POST | Upload document | FormData with `file` | `{path, filename, originalName, size, type}` |
| `/uploads/documents/{filename}` | GET | Serve uploaded document | - | Document file |

---

## Testing Checklist

### Tenant Portal Flow

- [ ] Login with tenant credentials
- [ ] Navigate to "New Request" tab
- [ ] Fill out maintenance request form
- [ ] Upload 1-5 photos
- [ ] See photo previews with remove button
- [ ] Submit request successfully
- [ ] See success message
- [ ] Navigate to "Request History"
- [ ] See submitted request with "Pending Approval" status

### AdminEstate Manager Flow

- [ ] Open Communication Center
- [ ] See new maintenance request with 🔧 icon
- [ ] Click to view request details
- [ ] See all maintenance data (category, priority, location, etc.)
- [ ] See uploaded photos (click to enlarge)
- [ ] Click "Approve & Create Work Order"
- [ ] Confirm approval dialog
- [ ] See success notification with work order ID
- [ ] Message status changes to "Approved"
- [ ] Work order appears in Work Orders tab
- [ ] Notification message sent to tenant

### Backend Verification

- [ ] Flask server running on port 5000
- [ ] Photos saved in `/uploads/maintenance/`
- [ ] data.json messages array has new entry
- [ ] Message has `type: 'maintenance_request'`
- [ ] Message has `status: 'pending_approval'`
- [ ] Photos array contains paths (not base64)
- [ ] After approval: work order in `workOrders` array
- [ ] After approval: message status = 'approved'
- [ ] After approval: `workOrderId` links message to work order

---

## Troubleshooting

### Common Issues

**Issue**: Maintenance requests not appearing in Communication Center
**Cause**: Multiple Flask servers running old code
**Solution**:
```bash
# Windows
netstat -ano | findstr ":5000"
powershell -Command "Stop-Process -Id {PID1},{PID2} -Force"

# Restart single server
cd backend-python
python app_simple.py
```

**Issue**: Photos not displaying
**Cause**: CORS policy or incorrect file paths
**Solution**: Verify Flask CORS settings include both ports:
```python
CORS(app, origins=['http://localhost:3000', 'http://localhost:3003'])
```

**Issue**: Message selection resets every 5 seconds
**Cause**: Auto-refresh not preserving selection
**Solution**: Already fixed with `useRef` hook. Ensure using latest Communication.js

**Issue**: data.json grows to 5MB+
**Cause**: Base64 images embedded instead of file paths
**Solution**: Clear data.json, restart backend, re-submit with new file upload system

---

## Future Enhancements

### Planned Features

1. **Real-time Notifications** - WebSocket instead of polling
2. **Tenant Chat** - Two-way messaging between tenant and manager
3. **Photo Thumbnails** - Generate compressed thumbnails for faster loading
4. **Request Categories** - Tenant can filter by category in history
5. **Recurring Requests** - Template system for common issues
6. **Vendor Assignment** - Auto-assign work orders to preferred vendors
7. **Email Notifications** - Send emails on request submission/approval
8. **Mobile App** - Native iOS/Android tenant portal

### Performance Optimizations

- [ ] Implement pagination for messages (load 50 at a time)
- [ ] Add image compression before upload
- [ ] Cache uploaded photos in browser for offline viewing
- [ ] Lazy load photo previews in Communication Center
- [ ] Index messages by property for faster filtering

---

## Related Documentation

- **TECHNICAL_TERMINOLOGY.md** - Glossary of all technical terms
- **ARCHITECTURE_REFACTORING_GUIDE.md** - Overall system architecture
- **TENANT_PORTAL_GUIDE.md** - Tenant-facing documentation
- **PROJECT_OVERVIEW.md** - High-level feature overview

---

**Document Version**: 1.0
**Last Updated**: November 8, 2025
**Maintained By**: AdminEstate Development Team
