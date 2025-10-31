# AdminEstate 🏠

**Free, offline-first property management software for modern landlords.**

Stop paying $360/year for basic features. AdminEstate gives you enterprise-grade property management—tenant screening, financial tracking, AI analytics—at zero cost with complete data ownership.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.1-61dafb.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776ab.svg)](https://python.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[🚀 Quick Start](#quick-start) | [📖 Documentation](#documentation) | [🎥 Demo Video](#demo) | [💬 Community](#community)

---

## Why AdminEstate?

✅ **$0 Forever** - No subscriptions, no per-unit fees, no hidden costs
✅ **Offline-First** - Works without internet, syncs when you're online
✅ **Own Your Data** - Local storage, export anytime, no vendor lock-in
✅ **Professional Screening** - Complete tenant application workflow with risk assessment
✅ **Smart Analytics** - Pandas-powered portfolio metrics and data analysis
✅ **Modern UI** - Clean, intuitive interface built with React 19 and Tailwind CSS

### Save $360-480 Annually
vs TenantCloud ($480/year) | vs Avail ($108/unit/year) | vs RentRedi ($360/year)

---

## Features

### 🏢 Property Management
- **Property Portfolio** - Manage unlimited properties with detailed profiles
- **Unit Tracking** - Track individual units, amenities, and availability
- **Occupancy Dashboard** - Real-time vacancy and occupancy metrics
- **Document Storage** - Organize leases, inspections, and property documents

### 👥 Tenant Management
- **Tenant Profiles** - Complete contact info, lease terms, and history
- **Lease Tracking** - Monitor lease dates, renewals, and expirations
- **Payment History** - Track rent payments and outstanding balances
- **Communication Log** - Record all tenant interactions and notes

### 📋 Application & Screening System
Complete tenant screening workflow from application to approval:

#### **6-Step Application Form**
1. Personal Information
2. Employment & Income
3. Address History
4. References
5. Additional Information
6. Disclosures & Agreements

#### **Professional Screening Workflow**
- **Income Verification** - Automatic rent-to-income ratio calculation (3x rule)
- **Credit Check** - Track credit scores, collections, bankruptcies, evictions
- **Background Check** - Criminal history verification and status tracking
- **Employment Verification** - Employer confirmation and income validation
- **Rental History** - Previous landlord references and payment history
- **Document Review** - ID, pay stubs, bank statements, employment proof

#### **Automated Risk Assessment**
- **Risk Scoring Algorithm** (0-100 scale) with intelligent penalties/bonuses
- **Automatic Recommendations** - Approve, Conditional, or Reject
- **Conditional Approval Logic** - Smart suggestions for approval conditions
- **Real-time Score Updates** - Live calculation as you complete screening

**Screening Score Factors:**
```
Base Score: 100
- Background flagged: -15 points
- Credit score < 580: -30 points
- Eviction history: -25 points
- Rent-to-income ratio > 33%: -20 points
- Outstanding collections: -10 points
- Bankruptcy within 2 years: -15 points
+ Strong credit (>740): +5 points
+ Excellent rental history: +5 points
```

### 🔧 Maintenance & Work Orders
- **Work Order Tracking** - Create, assign, and track maintenance requests
- **Priority Management** - Urgent, high, medium, low priority levels
- **Status Workflow** - Pending → In Progress → Completed
- **Vendor Management** - Track contractors and service providers
- **Cost Tracking** - Monitor maintenance expenses per property

### 💰 Financial Management
- **Income Tracking** - Rent collection, late fees, other income
- **Expense Tracking** - Maintenance, utilities, insurance, taxes
- **Transaction History** - Complete financial audit trail
- **Portfolio Analytics** - Revenue, expenses, and profitability by property
- **Export Capabilities** - CSV/Excel export for tax preparation

### 📊 Analytics & Insights (Powered by Pandas)
- **Portfolio Dashboard** - Key metrics at a glance (total value, revenue, cap rates)
- **Occupancy Analytics** - Vacancy rates and occupancy trends
- **Property Type Analysis** - Performance grouped by property type
- **Rankings & Correlations** - Top performers and metric relationships
- **Financial Reports** - Income statements and cash flow analysis
- **Pandas Integration** - Advanced data analysis with Python backend (✅ Active)
- **Predictive ML Analytics** - Vacancy forecasting, rent optimization (🚧 Coming in Phase 4)

---

## Tech Stack

### Frontend
- **React 19** - Latest React with modern hooks and features
- **Tailwind CSS** - Utility-first styling for rapid UI development
- **Lucide React** - Beautiful, consistent iconography
- **Recharts** - Interactive data visualizations
- **ExcelJS** - Excel file generation and export

### Backend
- **Python 3.8+** - Robust backend processing
- **Flask** - Lightweight web framework
- **Pandas** - Advanced data analytics
- **Pydantic** - Data validation and schema management

### Architecture
- **Offline-First** - IndexedDB/localStorage with API fallback
- **RESTful API** - Clean, consistent backend endpoints
- **Component-Based** - Modular, reusable React components
- **Real-time Sync** - Automatic data synchronization

---

## Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **Python** 3.8+
- **Git** (optional)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/adminEstate.git
cd adminEstate
```

#### 2. Install Frontend Dependencies
```bash
npm install
```

#### 3. Install Backend Dependencies
```bash
cd backend-python
pip install -r requirements.txt
```

#### 4. Start the Backend Server
```bash
python app_simple.py
```
Backend runs on `http://localhost:8080`

#### 5. Start the Frontend (New Terminal)
```bash
npm start
```
Frontend runs on `http://localhost:3000`

### First Run
1. Open `http://localhost:3000` in your browser
2. The app works immediately with offline storage
3. Add your first property from the Properties tab
4. Start managing tenants and applications!

---

## Documentation

### User Guides
- [Getting Started Guide](documentations/GETTING_STARTED.md) *(coming soon)*
- [Property Management Tutorial](documentations/PROPERTY_MANAGEMENT.md) *(coming soon)*
- [Tenant Screening Workflow](documentations/TENANT_SCREENING.md) *(coming soon)*
- [Financial Tracking Guide](documentations/FINANCIAL_TRACKING.md) *(coming soon)*

### Developer Documentation
- [Architecture Overview](documentations/ARCHITECTURE.md) *(coming soon)*
- [API Reference](documentations/API_REFERENCE.md) *(coming soon)*
- [Contributing Guide](CONTRIBUTING.md) *(coming soon)*
- [Phase 2 Implementation Details](documentations/PHASE2_COMPLETE.md)

### Marketing & Strategy
- [Marketing Strategy](documentations/MARKETING_STRATEGY.md)
- [Feature Roadmap](documentations/ROADMAP.md) *(coming soon)*

---

## Comparison with Competitors

| Feature | AdminEstate | TenantCloud | Avail | RentRedi |
|---------|-------------|-------------|-------|----------|
| **Monthly Cost** | **$0** | $12-40 | $9/unit | $30 |
| **Annual Cost** | **$0** | $144-480 | $108/unit | $360 |
| **Offline Mode** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Data Ownership** | ✅ Full Control | ⚠️ Limited | ⚠️ Limited | ⚠️ Limited |
| **Tenant Screening** | ✅ Built-in | ✅ Yes | ✅ Yes | ✅ Yes |
| **Risk Scoring** | ✅ Automated | ❌ Manual | ❌ Manual | ❌ Manual |
| **Financial Tracking** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Work Orders** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Advanced Analytics** | ✅ Pandas-powered | ❌ Basic only | ❌ Basic only | ❌ Basic only |
| **Open Source** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Export Data** | ✅ Unlimited | ⚠️ Limited | ⚠️ Limited | ⚠️ Limited |
| **API Access** | ✅ Full | 💰 Paid Only | ❌ No | ❌ No |

**Your Savings:** $360-480 annually compared to commercial alternatives

---

## Screenshots

> **Note:** Screenshots coming soon! The app includes:
> - Modern dashboard with portfolio overview
> - Property management interface
> - Complete tenant application form (6 steps)
> - Interactive screening checklist (6 sections)
> - Financial tracking and analytics
> - Work order management system

---

## Demo

🎥 **Demo Video** *(coming soon)*

**Try It Yourself:**
Follow the [Quick Start](#quick-start) guide above to run AdminEstate locally in under 5 minutes.

---

## Roadmap

### ✅ Phase 1: Core Property Management (COMPLETE)
- Property and unit management
- Tenant tracking
- Work order system
- Financial transactions
- Document management

### ✅ Phase 2: Tenant Screening (COMPLETE)
- 6-step application form
- Professional screening workflow
- Automated risk assessment
- Income verification with 3x rule
- Credit, background, employment checks
- Recommendation engine

### 🚧 Phase 3: Third-Party Integrations (In Progress)
- Email notifications (SendGrid/Mailgun)
- Online rent collection (Stripe/Plaid)
- Background check APIs (Checkr)
- Credit report integration (TransUnion)
- Accounting software export (QuickBooks)

### 📋 Phase 4: Advanced Analytics (Planned)
- Predictive vacancy forecasting
- Rent optimization recommendations
- Market positioning analysis
- Portfolio risk assessment
- Investment opportunity scoring

### 📋 Phase 5: Mobile & Cloud (Planned)
- Mobile apps (iOS/Android)
- Optional cloud sync
- Multi-device support
- Team collaboration features
- White-label options

[View Full Roadmap](documentations/ROADMAP.md) *(coming soon)*

---

## Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines *(coming soon)*.

---

## Community

- **GitHub Issues** - [Report bugs or request features](https://github.com/yourusername/adminEstate/issues)
- **Discussions** - [Join the conversation](https://github.com/yourusername/adminEstate/discussions)
- **Twitter/X** - [@AdminEstate](https://twitter.com/adminestate) *(coming soon)*
- **Discord** - [Join our community](https://discord.gg/adminestate) *(coming soon)*

---

## Use Cases

### Small Landlords (1-10 Properties)
*"I was paying $30/month to TenantCloud for 3 rental properties. AdminEstate saved me $360/year while giving me better screening tools."*

**Perfect for:**
- Individual property owners
- First-time landlords
- Part-time property managers
- Family property portfolios

### Real Estate Investors
*"Managing 15 units with professional-grade software at zero cost. The screening workflow alone is worth hundreds per year."*

**Perfect for:**
- Growing portfolios
- House hackers
- BRRRR investors
- Rental property flippers

### Property Management Side Hustles
*"I manage properties for family and friends. AdminEstate lets me look professional without business overhead."*

**Perfect for:**
- Part-time property managers
- REI consultants
- Property management freelancers

---

## FAQ

### Is it really free?
**Yes, completely free.** No hidden costs, no per-unit fees, no premium tiers required for core features. The software is open-source and runs locally on your machine.

### Do I need technical skills?
**Basic computer skills are sufficient.** If you can install software and follow instructions, you can use AdminEstate. The interface is designed to be intuitive for non-technical users.

### Does it work offline?
**Yes!** AdminEstate is built with offline-first architecture. All data is stored locally and works without internet. When you reconnect, data syncs with the backend.

### Can I export my data?
**Absolutely.** You own 100% of your data. Export to CSV, Excel, or JSON at any time. No proprietary formats or vendor lock-in.

### Is my data secure?
**Your data stays on your machine.** Unlike cloud-only competitors, your sensitive tenant information is stored locally under your control.

### Can I use it for commercial property management?
**Yes!** While designed for residential properties, many features work for commercial real estate. Customization options available.

### What if I need help?
- Check the [Documentation](#documentation)
- Search [GitHub Issues](https://github.com/yourusername/adminEstate/issues)
- Ask in [Discussions](https://github.com/yourusername/adminEstate/discussions)
- Contact the community on Discord *(coming soon)*

### Can I contribute?
**Absolutely!** We welcome bug fixes, features, documentation, and translations. See [Contributing](#contributing).

---

## License

AdminEstate is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**What this means:**
- ✅ Use commercially
- ✅ Modify freely
- ✅ Distribute
- ✅ Private use
- ✅ No warranty

---

## Acknowledgments

Built with:
- [React](https://reactjs.org/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Flask](https://flask.palletsprojects.com/) - Backend framework
- [Pandas](https://pandas.pydata.org/) - Data analytics
- [Lucide](https://lucide.dev/) - Icons
- [Recharts](https://recharts.org/) - Data visualization

Inspired by the need for affordable, privacy-focused property management tools.

---

## Support the Project

If AdminEstate saves you money or helps your business:

⭐ **Star this repository** to show support
🐛 **Report bugs** to help improve the project
💡 **Suggest features** in GitHub Discussions
🔀 **Contribute code** or documentation
📢 **Share** with other landlords and property managers

---

## About

**AdminEstate** was created to solve a simple problem: property management software is expensive and privacy-invasive. Small landlords deserve professional tools without paying $30-40/month or surrendering data control.

Built with modern technologies and best practices, AdminEstate proves that open-source can compete with commercial solutions.

**Project Status:** Active Development
**Current Version:** 0.2.0 (Phase 2 Complete)
**Maintained by:** [Your Name](https://github.com/yourusername)

---

## Contact

- **GitHub:** [@yourusername](https://github.com/yourusername)
- **Email:** your.email@example.com
- **LinkedIn:** [Your Profile](https://linkedin.com/in/yourprofile)
- **Twitter/X:** [@yourhandle](https://twitter.com/yourhandle)

---

<div align="center">

**Made with ❤️ for landlords who deserve better tools**

[⬆ Back to Top](#adminestate-)

</div>
