# AdminEstate Tenant Portal

A modern, user-friendly web portal for tenants to interact with property managers, submit maintenance requests, pay rent, and manage their tenancy.

## Features

### Current Features (MVP)
- ✅ **Authentication**
  - Secure login and registration
  - Unit/access code validation
  - Session management

- ✅ **Tenant Dashboard**
  - Rent due overview
  - Maintenance request status
  - Unread messages count
  - Upcoming events (inspections, renewals)
  - Quick action buttons

- ✅ **Maintenance Requests**
  - Category selection (Plumbing, Electrical, HVAC, etc.)
  - Priority levels (Low, Normal, High, Urgent)
  - Photo uploads (up to 5 photos)
  - Detailed descriptions
  - Access instructions
  - Preferred time scheduling
  - Real-time status updates

### Coming Soon
- 📝 **Applications** - Submit and track rental applications
- 💬 **Messaging** - Direct communication with property managers (with AI-powered routing)
- 💰 **Payments** - Online rent payment and payment history
- 📄 **Documents** - Access lease agreements and important documents
- 🔔 **Notifications** - Real-time alerts for important updates

## Technology Stack

- **Frontend**: React 18
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Build Tool**: Create React App

## Project Structure

```
tenant-portal/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx           # Login page with mock authentication
│   │   │   └── Register.jsx        # Registration with unit code validation
│   │   ├── dashboard/
│   │   │   └── TenantDashboard.jsx # Main dashboard with stats and quick actions
│   │   ├── maintenance/
│   │   │   ├── MaintenanceRequestForm.jsx  # Full-featured request form
│   │   │   └── MaintenanceList.jsx         # List of all requests
│   │   ├── applications/
│   │   │   ├── ApplicationForm.jsx
│   │   │   └── ApplicationStatus.jsx
│   │   ├── messages/
│   │   │   └── MessageThread.jsx
│   │   ├── payments/
│   │   │   └── PaymentHistory.jsx
│   │   └── documents/
│   │       └── LeaseDocuments.jsx
│   ├── App.jsx                    # Main app with routing
│   ├── App.css
│   ├── index.js                   # Entry point
│   └── index.css                  # Global styles with Tailwind
├── public/
│   └── index.html
├── package.json
├── tailwind.config.js
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Navigate to the tenant portal directory:
   ```bash
   cd tenant-portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Development Mode

In development mode, the app uses mock authentication and mock API responses. You can log in with any email/password combination.

**Mock User Data:**
- Name: John Smith
- Unit: A101
- Property: Sunset Apartments
- Email: Any valid email format
- Password: Any password

## Integration with AdminEstate

This tenant portal is designed to work alongside the AdminEstate desktop application.

### Architecture

```
┌─────────────────────────┐
│ AdminEstate Desktop App │
│ (Property Managers)     │
└────────────┬────────────┘
             │
             ↓
┌────────────────────────┐
│   API Server           │
│   (Backend)            │
└────────────┬───────────┘
             │
             ↓
┌────────────────────────┐
│ Tenant Portal Web App  │
│ (Tenants)              │
└────────────────────────┘
```

### API Integration

The tenant portal expects a backend API at `http://localhost:5000` (configurable in `package.json` proxy setting).

**Required API Endpoints:**

```
POST   /api/tenant/login           # Tenant authentication
POST   /api/tenant/register        # New tenant registration
GET    /api/tenant/profile         # Get tenant details
POST   /api/tenant/maintenance     # Submit maintenance request
GET    /api/tenant/maintenance     # Get all maintenance requests
GET    /api/tenant/messages        # Get messages
POST   /api/tenant/messages        # Send message
GET    /api/tenant/payments        # Get payment history
GET    /api/tenant/documents       # Get lease documents
```

## Key Features Explained

### Maintenance Request System

The maintenance request form includes:

1. **Category Selection** - Visual cards for different issue types:
   - Plumbing 🚰
   - Electrical ⚡
   - HVAC/Heating/Cooling ❄️
   - Appliance 🔌
   - Structural/Walls 🏗️
   - Doors/Windows 🚪
   - Pest Control 🐛
   - Other 🔧

2. **Priority Levels**:
   - **Low**: Can wait a few days
   - **Normal**: Should be fixed soon
   - **High**: Needs attention ASAP
   - **Urgent/Emergency**: Immediate danger or damage

3. **Photo Upload**:
   - Upload up to 5 photos
   - Drag & drop support
   - Image preview
   - Easy removal

4. **Smart Features**:
   - Location specification
   - Detailed description field
   - Access instructions (for entry)
   - Preferred time scheduling
   - Emergency hotline alert for urgent requests

### Agentic Messaging (Coming Soon)

The messaging system will include AI-powered features:
- **Intent Detection**: Automatically detect maintenance requests, payment questions, etc.
- **Smart Routing**: Route messages to appropriate features
- **Auto-Population**: Pre-fill forms based on message content
- **Photo Analysis**: AI analyzes uploaded photos to detect issues
- **Manager Approval**: Property managers review and approve AI suggestions

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Deployment Options

### Option 1: Cloud Hosting (Recommended)
- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop `build/` folder
- **AWS S3 + CloudFront**: For large scale

### Option 2: Self-Hosting
- Build the app: `npm run build`
- Serve with nginx, Apache, or Node.js server
- Configure SSL certificates
- Set up domain and DNS

### Option 3: Same Server as AdminEstate
- Build both apps
- Serve tenant portal on port 3000
- Serve AdminEstate Electron app locally
- Use reverse proxy (nginx) to route traffic

## Environment Variables

Create a `.env` file in the tenant-portal directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_PROPERTY_NAME=Your Property Name
REACT_APP_SUPPORT_EMAIL=support@yourproperty.com
REACT_APP_SUPPORT_PHONE=(555) 123-4567
```

## Customization

### Branding

1. **Logo**: Replace logo in `public/` folder
2. **Colors**: Update Tailwind config in `tailwind.config.js`
3. **Property Name**: Update in Dashboard component or use environment variable

### Features

To enable/disable features, modify the navigation in `TenantDashboard.jsx`:

```javascript
const navigationItems = [
  { name: 'Dashboard', icon: Home, path: '/dashboard' },
  { name: 'Messages', icon: MessageSquare, path: '/messages' },
  { name: 'Maintenance', icon: Wrench, path: '/maintenance' },
  // { name: 'Payments', icon: DollarSign, path: '/payments' }, // Commented out = disabled
  { name: 'Documents', icon: FileText, path: '/documents' },
];
```

## Security

### Authentication
- JWT-based authentication
- Secure token storage in localStorage
- Protected routes with React Router
- Unit/access code validation

### Data Protection
- HTTPS only in production
- Input validation on all forms
- File upload restrictions (type, size)
- XSS protection via React

### Privacy
- Tenant data isolated by unit
- Managers can only see their properties
- Secure file storage for documents and photos

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
```

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Tailwind Not Working
Ensure these files exist:
- `tailwind.config.js`
- `postcss.config.js`
- `src/index.css` has Tailwind directives

## Next Steps

1. **Connect to Backend API**
   - Build Node.js/Express backend
   - Implement all API endpoints
   - Connect to database

2. **Complete Remaining Features**
   - Application submission system
   - Messaging with AI routing
   - Payment integration (Stripe/PayPal)
   - Document management

3. **Testing**
   - Unit tests with Jest
   - Integration tests
   - E2E tests with Cypress

4. **Deploy**
   - Choose hosting provider
   - Set up CI/CD
   - Configure domain and SSL

## Support

For questions or issues:
- Contact: Property Manager
- Email: support@adminestate.com
- Phone: (555) 123-4567

## License

Proprietary - AdminEstate Property Management System
