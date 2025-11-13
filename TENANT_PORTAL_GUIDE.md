# Tenant Portal Setup Guide

This guide explains how to set up and run the AdminEstate Tenant Portal alongside your desktop application.

## 🎯 What is the Tenant Portal?

The Tenant Portal is a web application that allows your tenants to:
- Submit maintenance requests with photos
- View their rent payment status
- Message you directly (with AI-powered smart routing)
- Access lease documents
- Track application status

It works alongside your AdminEstate desktop app, allowing you (the property manager) to receive and manage tenant requests.

## 📁 Project Structure

```
adminEstate/
├── src/                          # Desktop app (property manager)
├── public/
├── tenant-portal/               # NEW - Web app (tenants)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # Login/Register
│   │   │   ├── dashboard/      # Tenant dashboard
│   │   │   ├── maintenance/    # Maintenance requests
│   │   │   ├── messages/       # Communication
│   │   │   └── ...
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── README.md               # Detailed documentation
├── package.json                 # Desktop app dependencies
└── TENANT_PORTAL_GUIDE.md      # This file
```

## 🚀 Quick Start

### Step 1: Install Tenant Portal Dependencies

```bash
cd tenant-portal
npm install
```

### Step 2: Run the Tenant Portal

```bash
npm start
```

The tenant portal will open at `http://localhost:3000`

### Step 3: Test the Portal

1. Open `http://localhost:3000` in your browser
2. Click "Register here" or try logging in with any email/password (mock mode)
3. Explore the dashboard and features

## 🎨 What You Can Do Right Now

### ✅ Fully Functional Features

1. **Login/Registration Pages**
   - Beautiful, professional UI
   - Form validation
   - Mock authentication (works offline)

2. **Tenant Dashboard**
   - Overview of rent due
   - Maintenance request status
   - Unread messages count
   - Quick action buttons
   - Responsive design (works on mobile)

3. **Maintenance Request Form** ⭐
   - Category selection with icons (Plumbing, Electrical, HVAC, etc.)
   - Priority levels (Low, Normal, High, Urgent)
   - Photo upload (up to 5 photos)
   - Location and detailed description
   - Access instructions
   - Preferred time scheduling
   - Emergency alerts

### 🚧 Coming Soon (Placeholder Pages)

- Application submission
- Messaging system (with AI routing)
- Payment portal
- Document viewer

## 🔄 How It Works (Current vs. Future)

### Current State (Development Mode)
```
Tenant Portal (Web)
    ↓
  Mock Data (no backend needed)
    ↓
Works independently for testing
```

### Future State (Production)
```
Tenant Portal (Web)
    ↓
  API Server (Node.js/Express) ← proxy: "http://localhost:5000"
    ↓
  Database (PostgreSQL/MySQL)
    ↑
AdminEstate Desktop App
```

Both apps will share the same database through the API.

**Note**: The `"proxy": "http://localhost:5000"` in package.json forwards API calls from the React app (port 3000) to your backend server (port 5000) during development. This prevents CORS issues and allows seamless communication between frontend and backend.

## 💡 Key Features Explained

### Maintenance Request System

The tenant fills out a comprehensive form:

1. **Category**: Plumbing, Electrical, HVAC, etc. (visual selection)
2. **Priority**: From Low to Urgent/Emergency
3. **Photos**: Upload up to 5 photos showing the issue
4. **Details**: Location, description, access instructions
5. **Scheduling**: Preferred time for maintenance visit

**On submission**, the request will:
- Appear in your AdminEstate Communication Center
- Trigger AI analysis (when implemented)
- Route to appropriate Work Orders section
- Notify you via the agentic messaging system

### Agentic Messaging Integration (Future)

The maintenance form we built is the **foundation** for agentic messaging. Here's how they work together:

#### Traditional Pathway (Available Now)
```
Tenant clicks "Submit Maintenance Request"
    ↓
Fills out form manually
    ↓
Submits → Goes to manager
```

#### Agentic Pathway (Coming Soon)
```
Tenant opens Messages
    ↓
Types: "My AC isn't cooling"
    ↓
AI intercepts and analyzes message
    ↓
AI detects: Maintenance request (HVAC, Medium priority)
    ↓
AI shows popup: "Create maintenance request?"
    ↓
If tenant approves → Maintenance form auto-filled
    ↓
Tenant adds photo if needed → Submits
    ↓
Manager sees in AdminEstate:
  "AI-detected maintenance request"
  [Approve & Create Work Order]
```

**Key Point**: The maintenance form isn't replaced by AI - it's **enhanced** by AI. Tenants can still use the form directly, OR use the AI-powered messaging that auto-fills the same form.

## 🔧 Agentic Messaging Architecture

When fully implemented, the system will work like this:

### Tenant Side (Portal)
```javascript
// MessageThread.jsx (future)
1. Tenant types message: "Kitchen sink is clogged"
2. Message sent to backend
3. Backend AI analyzes:
   - Intent: maintenance_request
   - Category: plumbing
   - Priority: medium
   - Location: kitchen
4. AI response shown to tenant:
   "🤖 I detected a maintenance issue. Create request?"
   [Yes] [No] [Edit Details]
5. If Yes → Auto-fill maintenance form → Submit
```

### Manager Side (AdminEstate Desktop App)
```javascript
// Communication.js enhancement
1. Receive tenant message
2. See AI analysis:
   ┌────────────────────────────────┐
   │ 💬 Message from John Smith     │
   │ "Kitchen sink is clogged"      │
   │                                │
   │ 🤖 AI Detected: Maintenance    │
   │ Category: Plumbing             │
   │ Priority: Medium               │
   │                                │
   │ [✓ Create Work Order]         │
   │ [View Details] [Reply]         │
   └────────────────────────────────┘
3. Click "Create Work Order"
4. Work order created with all details pre-filled
5. Just assign technician and approve
```

## 📋 Next Steps to Complete Integration

### Phase 1: ✅ Complete (What We Just Built)
- Tenant portal structure
- Authentication (Login/Register)
- Tenant dashboard
- Maintenance request form (foundation for AI)
- All UI components

### Phase 2: Build Backend API

Create a Node.js/Express server:

```javascript
// api-server/server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Authentication
app.post('/api/tenant/login', (req, res) => {
  // Validate credentials
  // Return JWT token
});

// Maintenance requests
app.post('/api/tenant/maintenance', (req, res) => {
  const { category, priority, description, photos } = req.body;
  // Save to database
  // Notify manager (via WebSocket or polling)
  res.json({ success: true, id: 123 });
});

// Messages with AI analysis
app.post('/api/tenant/messages', async (req, res) => {
  const { message, tenantId } = req.body;

  // Step 1: Save message
  await saveMessage(message);

  // Step 2: AI analysis
  const aiAnalysis = await analyzeWithAI(message);

  // Step 3: Return with AI suggestions
  res.json({
    success: true,
    aiSuggestion: aiAnalysis
  });
});

app.listen(5000, () => {
  console.log('API server running on port 5000');
});
```

### Phase 3: Add AI Integration

```javascript
// ai-agent.js
async function analyzeWithAI(message) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: `You are a property management assistant. Analyze tenant messages and detect:
          - Intent (maintenance_request, payment_question, lease_question, general)
          - If maintenance: category, priority, location
          Return JSON only.`
      }, {
        role: 'user',
        content: message
      }]
    })
  });

  return await response.json();
}
```

### Phase 4: Connect AdminEstate Desktop App

Enhance your Communication.js component:

```javascript
// In AdminEstate/src/components/Communication.js

// Poll for new tenant messages
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await fetch('http://localhost:5000/api/admin/messages/new');
    const newMessages = await response.json();

    newMessages.forEach(msg => {
      if (msg.aiSuggestion) {
        // Show AI-detected action popup
        showAISuggestion(msg);
      }
    });
  }, 5000); // Check every 5 seconds

  return () => clearInterval(interval);
}, []);

// Handle manager approval
const handleApproveAISuggestion = async (message) => {
  if (message.aiSuggestion.intent === 'maintenance_request') {
    // Create work order with pre-filled data
    createWorkOrder({
      tenantId: message.tenantId,
      category: message.aiSuggestion.category,
      priority: message.aiSuggestion.priority,
      description: message.content,
      location: message.aiSuggestion.location
    });
  }
};
```

### Phase 5: Deploy

**Option A: Cloud Hosting (Easiest)**
```bash
# Deploy tenant portal to Vercel
cd tenant-portal
npm run build
vercel deploy

# Deploy backend to Railway
# Connect database (Supabase/PlanetScale)
```

**Option B: Self-Hosting**
```bash
# Build tenant portal
cd tenant-portal
npm run build

# Serve with nginx or Node.js
# Configure SSL with Let's Encrypt
# Set up domain and DNS
```

## 🎯 Testing the Tenant Portal

### Scenario 1: Submit Maintenance Request

1. Go to Dashboard → Click "Submit Maintenance Request"
2. Select category: "Plumbing"
3. Set priority: "High"
4. Location: "Kitchen"
5. Title: "Leaking faucet"
6. Description: "Water dripping from kitchen faucet for 2 days"
7. Upload a photo (optional)
8. Click "Submit Request"
9. ✅ Success! Redirected to maintenance list

### Scenario 2: Test AI Message Detection (Future)

1. Go to Messages
2. Type: "The AC in my bedroom isn't working and it's really hot"
3. Send message
4. See AI popup:
   ```
   🤖 Maintenance Issue Detected
   Category: HVAC
   Priority: High (mentioned discomfort)
   Location: Bedroom

   [Create Maintenance Request]
   [Just Send Message]
   [Edit Details]
   ```
5. Click "Create Request" → Form opens pre-filled
6. Add photo if desired → Submit
7. Manager receives in AdminEstate with AI analysis

### Scenario 3: Test Photo Analysis AI (Future)

1. Go to Messages
2. Upload photo of water leak
3. AI analyzes image
4. Shows: "Water damage detected. Priority: Urgent"
5. Auto-suggests maintenance request
6. Tenant approves → Creates urgent work order

## 🔧 Customization

### Change Property Name

Edit `tenant-portal/src/components/dashboard/TenantDashboard.jsx`:

```javascript
<p className="text-sm text-gray-600">
  {user?.tenant?.property || 'Your Property Name Here'}
</p>
```

### Change Colors/Branding

Edit `tenant-portal/tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // Change to your brand color
        secondary: '#8b5cf6'
      }
    }
  }
}
```

### Add Your Logo

1. Add logo to `tenant-portal/public/logo.png`
2. Update Login.jsx:
```javascript
<img src="/logo.png" alt="Logo" className="w-16 h-16" />
```

### Configure API URL

Create `tenant-portal/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_PROPERTY_NAME=Sunset Apartments
REACT_APP_SUPPORT_EMAIL=support@yourproperty.com
REACT_APP_SUPPORT_PHONE=(555) 123-4567
```

## 🐛 Troubleshooting

### "Port 3000 already in use"

```bash
# Option 1: Kill the process
npx kill-port 3000

# Option 2: Use different port
PORT=3001 npm start
```

### Tailwind styles not working

Verify these files exist:
- ✅ `tenant-portal/tailwind.config.js`
- ✅ `tenant-portal/postcss.config.js`
- ✅ Tailwind directives in `src/index.css`

If missing, run:
```bash
cd tenant-portal
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Build fails

```bash
cd tenant-portal
rm -rf node_modules package-lock.json
npm install
npm start
```

### Proxy not working

The proxy setting (`"proxy": "http://localhost:5000"`) only works in development. Make sure:
1. Backend server is running on port 5000
2. You're using relative URLs in fetch calls: `/api/tenant/...` (not full URLs)
3. Backend has proper routes defined

## 📊 Current Status

| Feature | Status | Notes |
|---------|--------|-------|
| **Frontend** |
| Login/Register | ✅ Complete | Mock authentication |
| Tenant Dashboard | ✅ Complete | Fully functional UI |
| Maintenance Request Form | ✅ Complete | Photo upload, all fields, validation |
| Maintenance List | ✅ Basic | Shows placeholder data |
| Messages | 🚧 Placeholder | UI created, needs backend + AI |
| Applications | 🚧 Placeholder | Coming soon |
| Payments | 🚧 Placeholder | Coming soon |
| Documents | 🚧 Placeholder | Coming soon |
| **Backend** |
| API Server | ⏳ Not started | Node.js/Express needed |
| Database | ⏳ Not started | PostgreSQL/MySQL |
| Authentication | ⏳ Not started | JWT tokens |
| File Upload | ⏳ Not started | For photos/documents |
| **AI Features** |
| Intent Detection | ⏳ Not started | OpenAI/Claude API |
| Photo Analysis | ⏳ Not started | Computer vision |
| Auto-fill Forms | ⏳ Not started | Based on AI analysis |
| Context Awareness | ⏳ Not started | Learning from history |
| **Integration** |
| AdminEstate Connection | ⏳ Not started | WebSocket or polling |
| Manager Approval UI | ⏳ Not started | In Communication Center |
| Work Order Creation | ⏳ Not started | Auto-populate from AI |

## 💰 Cost Estimate

### Development (Free)
- Run locally: $0
- Vercel hosting (tenant portal): $0/month
- Supabase (database): $0/month (free tier)

### Production
- Backend hosting (Railway/Render): $5-10/month
- Database (PostgreSQL): $0-10/month
- AI API (OpenAI/Claude): $10-50/month (usage-based)
- Domain name: $12/year
- **Total**: ~$15-70/month

### Self-Hosting
- Your server/PC 24/7: ~$10/month electricity
- Domain: $12/year
- **Total**: ~$11/month

## 🎓 Learning Resources

- **React**: https://react.dev/learn
- **React Router**: https://reactrouter.com/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Node.js/Express**: https://expressjs.com/
- **OpenAI API**: https://platform.openai.com/docs
- **REST APIs**: https://restfulapi.net/

## 📞 Implementation Roadmap

### Week 1-2: Backend Foundation
- [ ] Set up Node.js/Express server
- [ ] Create database schema
- [ ] Implement authentication (JWT)
- [ ] Build API endpoints for maintenance, messages
- [ ] Test with Postman

### Week 3: Connect Frontend to Backend
- [ ] Remove mock data from tenant portal
- [ ] Connect all forms to real API
- [ ] Implement file upload for photos
- [ ] Test full workflow

### Week 4: AI Integration
- [ ] Set up OpenAI/Claude API
- [ ] Build intent detection
- [ ] Implement message analysis
- [ ] Add AI suggestion popups

### Week 5: AdminEstate Integration
- [ ] Enhance Communication.js
- [ ] Add WebSocket for real-time updates
- [ ] Build manager approval UI
- [ ] Test end-to-end workflow

### Week 6: Deploy & Polish
- [ ] Deploy to production
- [ ] Set up monitoring
- [ ] User testing
- [ ] Bug fixes and refinements

## 🚀 Quick Commands Reference

```bash
# Start tenant portal (development)
cd tenant-portal
npm start

# Build tenant portal (production)
cd tenant-portal
npm run build

# Start backend server (when created)
cd api-server
npm start

# Run both simultaneously (future)
# Terminal 1:
cd tenant-portal && npm start

# Terminal 2:
cd api-server && npm start

# Terminal 3:
cd .. && npm run electron-dev  # AdminEstate desktop app
```

## 🤝 How Everything Connects

```
┌─────────────────────────────────────────────────────────┐
│                    Tenant's Experience                  │
├─────────────────────────────────────────────────────────┤
│ 1. Opens tenant portal in browser                       │
│ 2. Types message: "AC is broken"                        │
│ 3. AI suggests: Create maintenance request?             │
│ 4. Clicks Yes → Form auto-filled → Submits             │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Backend Processing                     │
├─────────────────────────────────────────────────────────┤
│ 1. Receives message via API                             │
│ 2. AI analyzes: HVAC issue, Medium priority             │
│ 3. Creates maintenance request in database              │
│ 4. Notifies AdminEstate desktop app                     │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  Manager's Experience                    │
├─────────────────────────────────────────────────────────┤
│ 1. AdminEstate shows notification                        │
│ 2. Opens Communication Center                            │
│ 3. Sees AI-analyzed request                              │
│ 4. Clicks "Create Work Order"                           │
│ 5. Work order created with all details                  │
│ 6. Assigns technician → Done!                           │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Ready to Test!

```bash
cd tenant-portal
npm install
npm start
```

Then open http://localhost:3000 and explore! 🚀

The portal is ready for testing with mock data. Once you build the backend API and AI integration, everything will connect seamlessly with your AdminEstate desktop app.

**Next recommended action**: Test the current features, then we can move on to building the backend API server and AI integration.
