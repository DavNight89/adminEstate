# Tenant Application & Screening Integration Plan

A comprehensive plan for integrating tenant application processing and screening capabilities into AdminEstate.

---

## Table of Contents
1. [Overview](#overview)
2. [Feature Requirements](#feature-requirements)
3. [Technical Architecture](#technical-architecture)
4. [Implementation Phases](#implementation-phases)
5. [Data Models](#data-models)
6. [API Endpoints](#api-endpoints)
7. [UI Components](#ui-components)
8. [Third-Party Integrations](#third-party-integrations)
9. [Compliance & Legal](#compliance-legal)
10. [Testing Strategy](#testing-strategy)

---

## Overview

### What This Feature Adds

Tenant application and screening transforms AdminEstate from a portfolio management tool into a complete tenant lifecycle platform by adding:

1. **Tenant Application Portal** - Online application submission
2. **Application Management** - Track and review applications
3. **Background Screening** - Automated background, credit, and reference checks
4. **Decision Workflow** - Approve, deny, or conditionally approve tenants
5. **Conversion to Tenant** - Seamlessly convert approved applications to active tenants

### Business Value

- **For Property Managers:**
  - Streamline tenant screening process
  - Reduce time-to-fill vacant units
  - Improve tenant quality through systematic screening
  - Reduce risk of problematic tenants
  - Maintain compliance with fair housing laws

- **For Prospective Tenants:**
  - Simplified online application process
  - Transparent application status tracking
  - Faster decision turnaround

- **For Your Portfolio:**
  - Shows end-to-end property management workflow
  - Demonstrates complex business logic implementation
  - Shows integration capabilities with third-party APIs
  - Highlights compliance and data privacy awareness

---

## Feature Requirements

### Core Features (MVP)

#### 1. Application Submission
- [ ] Online application form with validation
- [ ] File uploads (ID, pay stubs, references)
- [ ] Application fee payment integration (optional)
- [ ] Email confirmation upon submission
- [ ] Application tracking number

#### 2. Application Management Dashboard
- [ ] List all applications with status filters
- [ ] Search by applicant name, property, date
- [ ] Sort by submission date, property, status
- [ ] Quick actions: View, Screen, Approve, Reject
- [ ] Status badges (New, Screening, Approved, Rejected)

#### 3. Screening Workflow
- [ ] Background check initiation and tracking
- [ ] Credit check initiation and tracking
- [ ] Employment verification tracking
- [ ] Reference check tracking (with contact log)
- [ ] Document review checklist
- [ ] Overall screening score/recommendation

#### 4. Decision Making
- [ ] Approve/Reject with reason
- [ ] Conditional approval (e.g., higher deposit)
- [ ] Automated email notifications to applicants
- [ ] Audit trail of decisions
- [ ] Convert approved applications to tenant records

#### 5. Compliance Features
- [ ] Fair Housing Act compliance warnings
- [ ] Adverse action notice generation
- [ ] Data retention policy enforcement
- [ ] Applicant data privacy controls
- [ ] FCRA-compliant screening disclosures

### Advanced Features (Future)

- [ ] Public-facing application portal (separate from admin)
- [ ] Online rent payment integration
- [ ] Co-applicant support
- [ ] Guarantor/co-signer forms
- [ ] Automated income verification (via Plaid)
- [ ] Pet screening
- [ ] Rental history verification
- [ ] Applicant self-service portal (check status)
- [ ] Waitlist management
- [ ] Lease template generation upon approval
- [ ] E-signature integration

---

## Technical Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│  Components:                                                 │
│  - ApplicationForm.jsx (Public + Admin)                      │
│  - ApplicationsList.jsx (Admin)                              │
│  - ApplicationDetails.jsx (Admin)                            │
│  - ScreeningWorkflow.jsx (Admin)                             │
│  - ScreeningChecklist.jsx (Admin)                            │
│  - DecisionModal.jsx (Admin)                                 │
│                                                              │
│  Hooks:                                                      │
│  - useApplications.js (CRUD operations)                      │
│  - useScreening.js (Screening workflow)                      │
│                                                              │
│  Services:                                                   │
│  - applicationService.js (API calls)                         │
│  - screeningService.js (Third-party API integration)         │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND API (Python/Flask)                 │
├─────────────────────────────────────────────────────────────┤
│  Routes:                                                     │
│  - /api/applications/* (CRUD)                                │
│  - /api/screening/* (Screening workflow)                     │
│  - /api/background-checks/* (Third-party proxy)              │
│                                                              │
│  Services:                                                   │
│  - applicationService.py (Business logic)                    │
│  - screeningService.py (Screening orchestration)             │
│  - notificationService.py (Email notifications)              │
│  - complianceService.py (Fair Housing checks)                │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                    DATA STORAGE LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  Primary: data.json                                          │
│  - applications: []                                          │
│  - screening: []                                             │
│  - applicationDocuments: []                                  │
│                                                              │
│  Client-side: localStorage + IndexedDB                       │
│  - Offline-first capability                                  │
│  - Sync when online                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│              THIRD-PARTY INTEGRATIONS (Optional)             │
├─────────────────────────────────────────────────────────────┤
│  Background Checks:                                          │
│  - Checkr API                                                │
│  - Sterling API                                              │
│  - GoodHire API                                              │
│                                                              │
│  Credit Reports:                                             │
│  - TransUnion SmartMove                                      │
│  - Experian RentBureau                                       │
│  - MyRental (formerly RentPrep)                              │
│                                                              │
│  Payment Processing:                                         │
│  - Stripe (application fees)                                 │
│  - PayPal                                                    │
│                                                              │
│  Notifications:                                              │
│  - SendGrid (Email)                                          │
│  - Twilio (SMS - optional)                                   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Application Submission Flow:**
```
1. Applicant fills form → Frontend validation
2. Form submitted → POST /api/applications
3. Backend validates → Saves to data.json
4. Email notification sent → SendGrid/SMTP
5. Application ID returned → Confirmation shown
6. Offline sync → localStorage updated
```

**Screening Flow:**
```
1. Admin initiates screening → PUT /api/screening/{id}/start
2. Backend triggers checks → Third-party APIs (Checkr, TransUnion)
3. Webhook receives results → POST /api/webhooks/screening
4. Results stored → data.json updated
5. Admin notified → Email + in-app notification
6. Admin reviews → Approve/Reject decision
7. Applicant notified → Email with decision
```

---

## Implementation Phases

### Phase 1: Core Application Management (Week 1-2)

**Goal:** Build application submission and management without third-party integrations.

**Tasks:**
1. Create data models (Application, ApplicationDocument)
2. Build backend API endpoints (CRUD for applications)
3. Create ApplicationForm component
4. Create ApplicationsList dashboard
5. Create ApplicationDetails view
6. Add file upload for documents
7. Implement email notifications (basic SMTP)
8. Test offline functionality

**Deliverables:**
- Working application form
- Admin can view/manage applications
- Documents can be uploaded
- Basic email confirmations

### Phase 2: Manual Screening Workflow (Week 3)

**Goal:** Enable manual screening tracking without API integrations.

**Tasks:**
1. Create Screening data model
2. Build ScreeningWorkflow component
3. Create ScreeningChecklist component
4. Add manual check tracking:
   - Background check (manual upload)
   - Credit check (manual upload)
   - Employment verification (manual notes)
   - Reference checks (manual contact log)
5. Implement screening score calculation
6. Create decision modal (Approve/Reject/Conditional)
7. Build application → tenant conversion function

**Deliverables:**
- Manual screening workflow
- Checklist for tracking screening tasks
- Approve/reject functionality
- Convert approved apps to tenants

### Phase 3: Third-Party API Integration (Week 4-5)

**Goal:** Automate background and credit checks via APIs.

**Tasks:**
1. Research and select screening APIs (Checkr, TransUnion)
2. Set up API accounts and credentials
3. Build screeningService.py (API wrapper)
4. Implement background check API calls
5. Implement credit check API calls
6. Handle webhooks for async results
7. Store screening reports securely
8. Update UI to show API status

**Deliverables:**
- Automated background checks
- Automated credit checks
- Real-time screening status updates

### Phase 4: Compliance & Refinement (Week 6)

**Goal:** Ensure legal compliance and polish UX.

**Tasks:**
1. Add Fair Housing Act compliance warnings
2. Generate adverse action notices (FCRA)
3. Implement data retention policies
4. Add applicant consent forms
5. Create audit trail logging
6. Improve email templates
7. Add applicant portal (view status)
8. Performance optimization
9. Security audit

**Deliverables:**
- FCRA-compliant screening
- Fair Housing warnings
- Adverse action letter generation
- Applicant self-service portal

### Phase 5: Advanced Features (Week 7+)

**Goal:** Add nice-to-have features for production readiness.

**Tasks:**
- Co-applicant support
- Guarantor/co-signer workflows
- Application fee payment (Stripe)
- Lease generation upon approval
- E-signature integration (DocuSign)
- Advanced reporting/analytics
- Mobile optimization

---

## Data Models

### Application Model

```javascript
// Frontend: src/models/Application.js
class Application {
  constructor(data) {
    this.id = data.id || generateId();
    this.status = data.status || 'submitted'; // submitted, screening, approved, rejected, withdrawn
    this.submittedDate = data.submittedDate || new Date().toISOString();

    // Applicant Info
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phone = data.phone;
    this.dateOfBirth = data.dateOfBirth;
    this.ssn = data.ssn; // Encrypted in production

    // Application Details
    this.propertyId = data.propertyId;
    this.propertyName = data.propertyName;
    this.desiredUnit = data.desiredUnit;
    this.desiredMoveInDate = data.desiredMoveInDate;
    this.leaseTerm = data.leaseTerm; // 6, 12, 24 months

    // Employment Info
    this.currentEmployer = data.currentEmployer;
    this.jobTitle = data.jobTitle;
    this.employmentStartDate = data.employmentStartDate;
    this.monthlyIncome = data.monthlyIncome;
    this.employerPhone = data.employerPhone;

    // Additional Income
    this.additionalIncome = data.additionalIncome || [];

    // Current Address
    this.currentAddress = {
      street: data.currentAddress?.street,
      city: data.currentAddress?.city,
      state: data.currentAddress?.state,
      zip: data.currentAddress?.zip,
      landlordName: data.currentAddress?.landlordName,
      landlordPhone: data.currentAddress?.landlordPhone,
      monthlyRent: data.currentAddress?.monthlyRent,
      moveInDate: data.currentAddress?.moveInDate
    };

    // Previous Addresses (if < 2 years at current)
    this.previousAddresses = data.previousAddresses || [];

    // Emergency Contact
    this.emergencyContact = {
      name: data.emergencyContact?.name,
      relationship: data.emergencyContact?.relationship,
      phone: data.emergencyContact?.phone
    };

    // References
    this.personalReferences = data.personalReferences || [];

    // Occupants
    this.occupants = data.occupants || []; // Adults and children

    // Pets
    this.pets = data.pets || [];

    // Vehicle Info
    this.vehicles = data.vehicles || [];

    // Documents
    this.documents = data.documents || []; // IDs of uploaded docs

    // Disclosures
    this.hasEvictions = data.hasEvictions || false;
    this.hasBankruptcy = data.hasBankruptcy || false;
    this.hasCriminalHistory = data.hasCriminalHistory || false;
    this.disclosureNotes = data.disclosureNotes || '';

    // Consent
    this.backgroundCheckConsent = data.backgroundCheckConsent || false;
    this.creditCheckConsent = data.creditCheckConsent || false;
    this.consentSignature = data.consentSignature || '';
    this.consentDate = data.consentDate || null;

    // Admin Fields
    this.screeningId = data.screeningId || null;
    this.reviewedBy = data.reviewedBy || null;
    this.reviewedDate = data.reviewedDate || null;
    this.decisionReason = data.decisionReason || '';
    this.tenantId = data.tenantId || null; // If approved and converted

    // Timestamps
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}
```

### Screening Model

```javascript
// Frontend: src/models/Screening.js
class Screening {
  constructor(data) {
    this.id = data.id || generateId();
    this.applicationId = data.applicationId;
    this.applicantName = data.applicantName;
    this.status = data.status || 'pending'; // pending, in_progress, completed

    // Background Check
    this.backgroundCheck = {
      status: data.backgroundCheck?.status || 'not_started', // not_started, pending, completed, failed
      provider: data.backgroundCheck?.provider || null, // 'checkr', 'sterling', 'manual'
      orderedDate: data.backgroundCheck?.orderedDate || null,
      completedDate: data.backgroundCheck?.completedDate || null,
      reportUrl: data.backgroundCheck?.reportUrl || null,
      result: data.backgroundCheck?.result || null, // 'clear', 'consider', 'flagged'
      criminalRecords: data.backgroundCheck?.criminalRecords || [],
      sexOffenderRegistry: data.backgroundCheck?.sexOffenderRegistry || false,
      notes: data.backgroundCheck?.notes || ''
    };

    // Credit Check
    this.creditCheck = {
      status: data.creditCheck?.status || 'not_started',
      provider: data.creditCheck?.provider || null, // 'transunion', 'experian', 'manual'
      orderedDate: data.creditCheck?.orderedDate || null,
      completedDate: data.creditCheck?.completedDate || null,
      reportUrl: data.creditCheck?.reportUrl || null,
      creditScore: data.creditCheck?.creditScore || null,
      debtToIncomeRatio: data.creditCheck?.debtToIncomeRatio || null,
      collections: data.creditCheck?.collections || [],
      evictions: data.creditCheck?.evictions || [],
      bankruptcies: data.creditCheck?.bankruptcies || [],
      result: data.creditCheck?.result || null, // 'approved', 'conditional', 'denied'
      notes: data.creditCheck?.notes || ''
    };

    // Employment Verification
    this.employmentVerification = {
      status: data.employmentVerification?.status || 'not_started',
      verifiedDate: data.employmentVerification?.verifiedDate || null,
      employerConfirmed: data.employmentVerification?.employerConfirmed || false,
      positionConfirmed: data.employmentVerification?.positionConfirmed || false,
      incomeConfirmed: data.employmentVerification?.incomeConfirmed || false,
      contactedPerson: data.employmentVerification?.contactedPerson || '',
      notes: data.employmentVerification?.notes || ''
    };

    // Landlord/Rental History Verification
    this.rentalHistory = {
      status: data.rentalHistory?.status || 'not_started',
      currentLandlordContacted: data.rentalHistory?.currentLandlordContacted || false,
      previousLandlordContacted: data.rentalHistory?.previousLandlordContacted || false,
      paidOnTime: data.rentalHistory?.paidOnTime || null,
      propertyCondition: data.rentalHistory?.propertyCondition || null,
      leaseViolations: data.rentalHistory?.leaseViolations || [],
      wouldRentAgain: data.rentalHistory?.wouldRentAgain || null,
      notes: data.rentalHistory?.notes || ''
    };

    // Reference Checks
    this.referenceChecks = data.referenceChecks || [
      // { name: '', relationship: '', contacted: false, contactDate: null, feedback: '', rating: 0 }
    ];

    // Document Review
    this.documentReview = {
      idVerified: data.documentReview?.idVerified || false,
      payStubsVerified: data.documentReview?.payStubsVerified || false,
      bankStatementsReviewed: data.documentReview?.bankStatementsReviewed || false,
      notes: data.documentReview?.notes || ''
    };

    // Income Verification
    this.incomeVerification = {
      monthlyIncome: data.incomeVerification?.monthlyIncome || 0,
      rentToIncomeRatio: data.incomeVerification?.rentToIncomeRatio || 0,
      meetsRequirements: data.incomeVerification?.meetsRequirements || false, // Usually 3x rent
      notes: data.incomeVerification?.notes || ''
    };

    // Overall Assessment
    this.overallScore = data.overallScore || 0; // 0-100
    this.recommendation = data.recommendation || null; // 'approve', 'conditional', 'deny'
    this.recommendationReason = data.recommendationReason || '';
    this.reviewedBy = data.reviewedBy || null;
    this.reviewedDate = data.reviewedDate || null;

    // Compliance
    this.adverseActionRequired = data.adverseActionRequired || false;
    this.adverseActionSentDate = data.adverseActionSentDate || null;

    // Timestamps
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}
```

### Backend Pydantic Models

```python
# backend-python/models/schemas.py

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum

class ApplicationStatus(str, Enum):
    SUBMITTED = "submitted"
    SCREENING = "screening"
    APPROVED = "approved"
    CONDITIONAL = "conditional"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

class ScreeningStatus(str, Enum):
    NOT_STARTED = "not_started"
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class CheckResult(str, Enum):
    CLEAR = "clear"
    APPROVED = "approved"
    CONDITIONAL = "conditional"
    FLAGGED = "flagged"
    DENIED = "denied"

# Nested Models
class Address(BaseModel):
    street: str
    city: str
    state: str
    zip: str
    landlordName: Optional[str] = None
    landlordPhone: Optional[str] = None
    monthlyRent: Optional[float] = None
    moveInDate: Optional[date] = None

class EmergencyContact(BaseModel):
    name: str
    relationship: str
    phone: str

class Reference(BaseModel):
    name: str
    relationship: str
    phone: str
    email: Optional[EmailStr] = None

class Occupant(BaseModel):
    name: str
    age: int
    relationship: str

class Pet(BaseModel):
    type: str  # dog, cat, other
    breed: Optional[str] = None
    weight: Optional[int] = None
    name: Optional[str] = None

class Vehicle(BaseModel):
    make: str
    model: str
    year: int
    licensePlate: str
    color: Optional[str] = None

# Application Model
class ApplicationBase(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    dateOfBirth: date
    propertyId: str
    propertyName: str
    desiredUnit: Optional[str] = None
    desiredMoveInDate: date
    leaseTerm: int  # months

    currentEmployer: str
    jobTitle: str
    employmentStartDate: date
    monthlyIncome: float
    employerPhone: str

    currentAddress: Address
    previousAddresses: List[Address] = []

    emergencyContact: EmergencyContact
    personalReferences: List[Reference] = []

    occupants: List[Occupant] = []
    pets: List[Pet] = []
    vehicles: List[Vehicle] = []

    hasEvictions: bool = False
    hasBankruptcy: bool = False
    hasCriminalHistory: bool = False
    disclosureNotes: Optional[str] = None

    backgroundCheckConsent: bool
    creditCheckConsent: bool
    consentSignature: str
    consentDate: datetime

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    reviewedBy: Optional[str] = None
    decisionReason: Optional[str] = None

class Application(ApplicationBase):
    id: str
    status: ApplicationStatus = ApplicationStatus.SUBMITTED
    submittedDate: datetime
    screeningId: Optional[str] = None
    reviewedBy: Optional[str] = None
    reviewedDate: Optional[datetime] = None
    decisionReason: Optional[str] = None
    tenantId: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

# Screening Models
class BackgroundCheck(BaseModel):
    status: ScreeningStatus = ScreeningStatus.NOT_STARTED
    provider: Optional[str] = None
    orderedDate: Optional[datetime] = None
    completedDate: Optional[datetime] = None
    reportUrl: Optional[str] = None
    result: Optional[CheckResult] = None
    criminalRecords: List[dict] = []
    sexOffenderRegistry: bool = False
    notes: Optional[str] = None

class CreditCheck(BaseModel):
    status: ScreeningStatus = ScreeningStatus.NOT_STARTED
    provider: Optional[str] = None
    orderedDate: Optional[datetime] = None
    completedDate: Optional[datetime] = None
    reportUrl: Optional[str] = None
    creditScore: Optional[int] = None
    debtToIncomeRatio: Optional[float] = None
    collections: List[dict] = []
    evictions: List[dict] = []
    bankruptcies: List[dict] = []
    result: Optional[CheckResult] = None
    notes: Optional[str] = None

class EmploymentVerification(BaseModel):
    status: ScreeningStatus = ScreeningStatus.NOT_STARTED
    verifiedDate: Optional[datetime] = None
    employerConfirmed: bool = False
    positionConfirmed: bool = False
    incomeConfirmed: bool = False
    contactedPerson: Optional[str] = None
    notes: Optional[str] = None

class RentalHistory(BaseModel):
    status: ScreeningStatus = ScreeningStatus.NOT_STARTED
    currentLandlordContacted: bool = False
    previousLandlordContacted: bool = False
    paidOnTime: Optional[bool] = None
    propertyCondition: Optional[str] = None
    leaseViolations: List[str] = []
    wouldRentAgain: Optional[bool] = None
    notes: Optional[str] = None

class ReferenceCheck(BaseModel):
    name: str
    relationship: str
    contacted: bool = False
    contactDate: Optional[datetime] = None
    feedback: Optional[str] = None
    rating: Optional[int] = None  # 1-5

class DocumentReview(BaseModel):
    idVerified: bool = False
    payStubsVerified: bool = False
    bankStatementsReviewed: bool = False
    notes: Optional[str] = None

class IncomeVerification(BaseModel):
    monthlyIncome: float
    rentToIncomeRatio: float
    meetsRequirements: bool = False
    notes: Optional[str] = None

class ScreeningBase(BaseModel):
    applicationId: str
    applicantName: str

class ScreeningCreate(ScreeningBase):
    pass

class ScreeningUpdate(BaseModel):
    backgroundCheck: Optional[BackgroundCheck] = None
    creditCheck: Optional[CreditCheck] = None
    employmentVerification: Optional[EmploymentVerification] = None
    rentalHistory: Optional[RentalHistory] = None
    referenceChecks: Optional[List[ReferenceCheck]] = None
    documentReview: Optional[DocumentReview] = None
    incomeVerification: Optional[IncomeVerification] = None
    recommendation: Optional[CheckResult] = None
    recommendationReason: Optional[str] = None

class Screening(ScreeningBase):
    id: str
    status: ScreeningStatus = ScreeningStatus.PENDING
    backgroundCheck: BackgroundCheck = BackgroundCheck()
    creditCheck: CreditCheck = CreditCheck()
    employmentVerification: EmploymentVerification = EmploymentVerification()
    rentalHistory: RentalHistory = RentalHistory()
    referenceChecks: List[ReferenceCheck] = []
    documentReview: DocumentReview = DocumentReview()
    incomeVerification: IncomeVerification
    overallScore: int = 0
    recommendation: Optional[CheckResult] = None
    recommendationReason: Optional[str] = None
    reviewedBy: Optional[str] = None
    reviewedDate: Optional[datetime] = None
    adverseActionRequired: bool = False
    adverseActionSentDate: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime
```

---

## API Endpoints

### Application Endpoints

```python
# backend-python/routes/applications.py

from flask import Blueprint, request, jsonify
from models.schemas import Application, ApplicationCreate, ApplicationUpdate
from services.applicationService import ApplicationService

applications_bp = Blueprint('applications', __name__)
app_service = ApplicationService()

@applications_bp.route('/api/applications', methods=['GET'])
def get_applications():
    """
    Get all applications with optional filters
    Query params: status, propertyId, dateFrom, dateTo, search
    """
    filters = {
        'status': request.args.get('status'),
        'propertyId': request.args.get('propertyId'),
        'dateFrom': request.args.get('dateFrom'),
        'dateTo': request.args.get('dateTo'),
        'search': request.args.get('search')
    }
    applications = app_service.get_all(filters)
    return jsonify(applications), 200

@applications_bp.route('/api/applications/<application_id>', methods=['GET'])
def get_application(application_id):
    """Get specific application by ID"""
    application = app_service.get_by_id(application_id)
    if not application:
        return jsonify({'error': 'Application not found'}), 404
    return jsonify(application), 200

@applications_bp.route('/api/applications', methods=['POST'])
def create_application():
    """Submit new application"""
    try:
        data = request.get_json()
        application = app_service.create(ApplicationCreate(**data))

        # Send confirmation email
        from services.notificationService import send_application_confirmation
        send_application_confirmation(application)

        return jsonify(application), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@applications_bp.route('/api/applications/<application_id>', methods=['PUT'])
def update_application(application_id):
    """Update application (status, review, etc.)"""
    try:
        data = request.get_json()
        application = app_service.update(application_id, ApplicationUpdate(**data))
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        return jsonify(application), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@applications_bp.route('/api/applications/<application_id>', methods=['DELETE'])
def delete_application(application_id):
    """Delete application (soft delete)"""
    success = app_service.delete(application_id)
    if not success:
        return jsonify({'error': 'Application not found'}), 404
    return jsonify({'message': 'Application deleted'}), 200

@applications_bp.route('/api/applications/<application_id>/documents', methods=['GET'])
def get_application_documents(application_id):
    """Get all documents for an application"""
    documents = app_service.get_documents(application_id)
    return jsonify(documents), 200

@applications_bp.route('/api/applications/<application_id>/convert', methods=['POST'])
def convert_to_tenant(application_id):
    """Convert approved application to active tenant"""
    try:
        tenant = app_service.convert_to_tenant(application_id)
        if not tenant:
            return jsonify({'error': 'Cannot convert application'}), 400
        return jsonify(tenant), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
```

### Screening Endpoints

```python
# backend-python/routes/screening.py

from flask import Blueprint, request, jsonify
from models.schemas import Screening, ScreeningCreate, ScreeningUpdate
from services.screeningService import ScreeningService

screening_bp = Blueprint('screening', __name__)
screening_service = ScreeningService()

@screening_bp.route('/api/screening', methods=['POST'])
def create_screening():
    """Create new screening record for an application"""
    try:
        data = request.get_json()
        screening = screening_service.create(ScreeningCreate(**data))
        return jsonify(screening), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@screening_bp.route('/api/screening/<screening_id>', methods=['GET'])
def get_screening(screening_id):
    """Get screening details"""
    screening = screening_service.get_by_id(screening_id)
    if not screening:
        return jsonify({'error': 'Screening not found'}), 404
    return jsonify(screening), 200

@screening_bp.route('/api/screening/application/<application_id>', methods=['GET'])
def get_screening_by_application(application_id):
    """Get screening by application ID"""
    screening = screening_service.get_by_application_id(application_id)
    if not screening:
        return jsonify({'error': 'Screening not found'}), 404
    return jsonify(screening), 200

@screening_bp.route('/api/screening/<screening_id>', methods=['PUT'])
def update_screening(screening_id):
    """Update screening checks and results"""
    try:
        data = request.get_json()
        screening = screening_service.update(screening_id, ScreeningUpdate(**data))
        if not screening:
            return jsonify({'error': 'Screening not found'}), 404
        return jsonify(screening), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@screening_bp.route('/api/screening/<screening_id>/background-check', methods=['POST'])
def initiate_background_check(screening_id):
    """Initiate automated background check via third-party API"""
    try:
        result = screening_service.initiate_background_check(screening_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@screening_bp.route('/api/screening/<screening_id>/credit-check', methods=['POST'])
def initiate_credit_check(screening_id):
    """Initiate automated credit check via third-party API"""
    try:
        result = screening_service.initiate_credit_check(screening_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@screening_bp.route('/api/screening/<screening_id>/score', methods=['GET'])
def calculate_screening_score(screening_id):
    """Calculate overall screening score"""
    try:
        score = screening_service.calculate_score(screening_id)
        return jsonify({'score': score}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@screening_bp.route('/api/screening/pending', methods=['GET'])
def get_pending_screenings():
    """Get all pending screenings"""
    screenings = screening_service.get_pending()
    return jsonify(screenings), 200
```

### Webhook Endpoints (for third-party integrations)

```python
# backend-python/routes/webhooks.py

from flask import Blueprint, request, jsonify
from services.screeningService import ScreeningService

webhooks_bp = Blueprint('webhooks', __name__)
screening_service = ScreeningService()

@webhooks_bp.route('/api/webhooks/checkr', methods=['POST'])
def checkr_webhook():
    """Receive background check results from Checkr"""
    try:
        data = request.get_json()
        # Verify webhook signature
        screening_service.process_checkr_webhook(data)
        return jsonify({'status': 'received'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@webhooks_bp.route('/api/webhooks/transunion', methods=['POST'])
def transunion_webhook():
    """Receive credit check results from TransUnion"""
    try:
        data = request.get_json()
        screening_service.process_transunion_webhook(data)
        return jsonify({'status': 'received'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
```

---

## UI Components

### 1. ApplicationForm Component

```jsx
// src/components/ApplicationForm.jsx

import React, { useState } from 'react';
import { User, Briefcase, Home, Users, FileText } from 'lucide-react';

export default function ApplicationForm({ propertyId, propertyName, onSubmit, onCancel }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',

    // Application Details
    propertyId: propertyId || '',
    propertyName: propertyName || '',
    desiredUnit: '',
    desiredMoveInDate: '',
    leaseTerm: 12,

    // Employment
    currentEmployer: '',
    jobTitle: '',
    employmentStartDate: '',
    monthlyIncome: '',
    employerPhone: '',

    // Current Address
    currentAddress: {
      street: '',
      city: '',
      state: '',
      zip: '',
      landlordName: '',
      landlordPhone: '',
      monthlyRent: '',
      moveInDate: ''
    },

    // Emergency Contact
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },

    // References
    personalReferences: [
      { name: '', relationship: '', phone: '', email: '' }
    ],

    // Occupants
    occupants: [],

    // Pets
    pets: [],

    // Vehicles
    vehicles: [],

    // Disclosures
    hasEvictions: false,
    hasBankruptcy: false,
    hasCriminalHistory: false,
    disclosureNotes: '',

    // Consent
    backgroundCheckConsent: false,
    creditCheckConsent: false,
    consentSignature: '',
    consentDate: null
  });

  const totalSteps = 6;

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      consentDate: new Date().toISOString()
    });
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`w-1/6 h-2 mx-1 rounded ${
                i <= step ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 text-center">
          Step {step} of {totalSteps}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <User className="mr-2" /> Personal Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Employment Information */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Briefcase className="mr-2" /> Employment Information
            </h2>

            {/* Employment fields... */}
          </div>
        )}

        {/* Step 3: Rental History */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Home className="mr-2" /> Rental History
            </h2>

            {/* Rental history fields... */}
          </div>
        )}

        {/* Step 4: References & Emergency Contact */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Users className="mr-2" /> References & Emergency Contact
            </h2>

            {/* References fields... */}
          </div>
        )}

        {/* Step 5: Additional Information */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FileText className="mr-2" /> Additional Information
            </h2>

            {/* Occupants, pets, vehicles, disclosures... */}
          </div>
        )}

        {/* Step 6: Consent & Signature */}
        {step === 6 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Review & Consent</h2>

            <div className="space-y-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  required
                  checked={formData.backgroundCheckConsent}
                  onChange={(e) => handleChange('backgroundCheckConsent', e.target.checked)}
                  className="mt-1 mr-2"
                />
                <span className="text-sm">
                  I authorize a background check to be conducted in accordance with the Fair Credit Reporting Act (FCRA).
                </span>
              </label>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  required
                  checked={formData.creditCheckConsent}
                  onChange={(e) => handleChange('creditCheckConsent', e.target.checked)}
                  className="mt-1 mr-2"
                />
                <span className="text-sm">
                  I authorize a credit check to be conducted as part of this rental application.
                </span>
              </label>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Electronic Signature (Type your full name) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.consentSignature}
                  onChange={(e) => handleChange('consentSignature', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="John Doe"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={step === 1 ? onCancel : prevStep}
            className="px-6 py-2 border rounded hover:bg-gray-50"
          >
            {step === 1 ? 'Cancel' : 'Previous'}
          </button>

          {step < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Submit Application
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
```

### 2. ApplicationsList Component

```jsx
// src/components/ApplicationsList.jsx

import React, { useState } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ApplicationsList({ applications, onView, onStartScreening }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusBadge = (status) => {
    const badges = {
      submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'Submitted' },
      screening: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Screening' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' },
      withdrawn: { color: 'bg-gray-100 text-gray-800', icon: XCircle, text: 'Withdrawn' }
    };

    const badge = badges[status] || badges.submitted;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.propertyName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold mb-4">Tenant Applications</h2>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="screening">Screening</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Move-In Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredApplications.map(app => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{app.firstName} {app.lastName}</div>
                    <div className="text-sm text-gray-500">{app.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">{app.propertyName}</div>
                  {app.desiredUnit && <div className="text-xs text-gray-500">Unit {app.desiredUnit}</div>}
                </td>
                <td className="px-6 py-4 text-sm">
                  {new Date(app.desiredMoveInDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  {new Date(app.submittedDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(app.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onView(app)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {app.status === 'submitted' && (
                      <button
                        onClick={() => onStartScreening(app)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Start Screening
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredApplications.length === 0 && (
        <div className="p-12 text-center text-gray-500">
          No applications found
        </div>
      )}
    </div>
  );
}
```

### 3. ScreeningWorkflow Component

```jsx
// src/components/ScreeningWorkflow.jsx

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function ScreeningWorkflow({ application, screening, onUpdate, onComplete }) {
  const [activeTab, setActiveTab] = useState('overview');

  const getCheckStatus = (check) => {
    if (!check) return { icon: Clock, color: 'text-gray-400', text: 'Not Started' };

    const statuses = {
      not_started: { icon: Clock, color: 'text-gray-400', text: 'Not Started' },
      pending: { icon: Clock, color: 'text-yellow-500', text: 'Pending' },
      in_progress: { icon: Clock, color: 'text-blue-500', text: 'In Progress' },
      completed: { icon: CheckCircle, color: 'text-green-500', text: 'Completed' },
      failed: { icon: XCircle, color: 'text-red-500', text: 'Failed' }
    };

    return statuses[check.status] || statuses.not_started;
  };

  const checks = [
    { id: 'background', name: 'Background Check', data: screening.backgroundCheck },
    { id: 'credit', name: 'Credit Check', data: screening.creditCheck },
    { id: 'employment', name: 'Employment Verification', data: screening.employmentVerification },
    { id: 'rental', name: 'Rental History', data: screening.rentalHistory },
    { id: 'documents', name: 'Document Review', data: screening.documentReview }
  ];

  const overallProgress = () => {
    const completed = checks.filter(c => c.data?.status === 'completed').length;
    return Math.round((completed / checks.length) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold mb-2">
          Screening: {application.firstName} {application.lastName}
        </h2>
        <p className="text-gray-600">
          Application for {application.propertyName} - Unit {application.desiredUnit}
        </p>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-medium">{overallProgress()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${overallProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex">
          {['overview', 'background', 'credit', 'employment', 'rental', 'decision'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-4">Screening Checklist</h3>
            {checks.map(check => {
              const status = getCheckStatus(check.data);
              const Icon = status.icon;
              return (
                <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <Icon className={`w-6 h-6 mr-3 ${status.color}`} />
                    <div>
                      <div className="font-medium">{check.name}</div>
                      <div className="text-sm text-gray-500">{status.text}</div>
                    </div>
                  </div>
                  {check.data?.status === 'not_started' && (
                    <button
                      onClick={() => onUpdate(check.id, 'start')}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Start Check
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'background' && (
          <div>
            <h3 className="text-lg font-bold mb-4">Background Check</h3>
            {/* Background check details and controls */}
            <button
              onClick={() => onUpdate('background', 'initiate')}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Order Background Check
            </button>
          </div>
        )}

        {activeTab === 'credit' && (
          <div>
            <h3 className="text-lg font-bold mb-4">Credit Check</h3>
            {/* Credit check details */}
          </div>
        )}

        {activeTab === 'employment' && (
          <div>
            <h3 className="text-lg font-bold mb-4">Employment Verification</h3>
            {/* Employment verification form */}
          </div>
        )}

        {activeTab === 'rental' && (
          <div>
            <h3 className="text-lg font-bold mb-4">Rental History</h3>
            {/* Rental history verification */}
          </div>
        )}

        {activeTab === 'decision' && (
          <div>
            <h3 className="text-lg font-bold mb-4">Final Decision</h3>

            {screening.recommendation && (
              <div className={`p-4 rounded-lg mb-4 ${
                screening.recommendation === 'approve' ? 'bg-green-50 border border-green-200' :
                screening.recommendation === 'conditional' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <div className="font-medium mb-2">
                  System Recommendation: {screening.recommendation.toUpperCase()}
                </div>
                <div className="text-sm">{screening.recommendationReason}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Decision</label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">Select decision...</option>
                  <option value="approve">Approve</option>
                  <option value="conditional">Conditional Approval</option>
                  <option value="reject">Reject</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2">Reason/Notes</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={4}
                  placeholder="Enter reason for decision..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => onComplete('approve')}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Approve & Convert to Tenant
                </button>
                <button
                  onClick={() => onComplete('reject')}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject Application
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Third-Party Integrations

### Recommended Screening Providers

#### 1. Background Checks

**Checkr** (Recommended)
- **Website:** https://checkr.com
- **Pricing:** $35-50 per check
- **API:** RESTful API with webhooks
- **Features:**
  - Criminal records search (county, state, federal)
  - Sex offender registry
  - Global watchlist
  - SSN trace
  - Turnaround: 1-3 days
- **Integration Complexity:** Medium
- **Documentation:** Excellent

**Sterling**
- **Pricing:** $40-60 per check
- **Similar features to Checkr**
- **Enterprise-focused**

#### 2. Credit Reports

**TransUnion SmartMove**
- **Website:** https://www.mysmartmove.com
- **Pricing:** $35-45 per report
- **Features:**
  - Credit score
  - Eviction history
  - Criminal background
  - Tenant pays option available
- **Integration:** API + SDK

**Experian RentBureau**
- **Pricing:** $30-40 per report
- **Specialized in rental history**

#### 3. Income Verification

**Plaid**
- **Website:** https://plaid.com
- **Pricing:** Per-verification pricing
- **Features:**
  - Automated bank account verification
  - Income verification
  - Employment verification
- **Integration:** RESTful API, webhooks

### Integration Code Examples

```javascript
// src/services/screeningService.js

class ScreeningService {
  constructor() {
    this.checkrApiKey = process.env.REACT_APP_CHECKR_API_KEY;
    this.checkrBaseUrl = 'https://api.checkr.com/v1';
  }

  async initiateBackgroundCheck(applicantData) {
    try {
      const response = await fetch(`${this.checkrBaseUrl}/candidates`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(this.checkrApiKey + ':')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: applicantData.firstName,
          last_name: applicantData.lastName,
          email: applicantData.email,
          dob: applicantData.dateOfBirth,
          ssn: applicantData.ssn,
          phone: applicantData.phone
        })
      });

      const candidate = await response.json();

      // Order a background check report
      const reportResponse = await fetch(`${this.checkrBaseUrl}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(this.checkrApiKey + ':')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidate_id: candidate.id,
          package: 'driver_pro' // or appropriate package
        })
      });

      const report = await reportResponse.json();
      return {
        provider: 'checkr',
        candidateId: candidate.id,
        reportId: report.id,
        status: 'pending'
      };
    } catch (error) {
      console.error('Background check initiation failed:', error);
      throw error;
    }
  }

  async initiateCreditCheck(applicantData) {
    // Similar implementation for TransUnion SmartMove
  }

  async handleCheckrWebhook(webhookData) {
    // Process webhook from Checkr when report is ready
    const { report_id, status, result } = webhookData;

    // Update screening record in database
    // Notify admin
  }
}

export default new ScreeningService();
```

---

## Compliance & Legal

### Fair Housing Act Compliance

**Key Requirements:**
1. Cannot discriminate based on:
   - Race, color, national origin
   - Religion
   - Sex (including sexual orientation and gender identity)
   - Familial status
   - Disability

2. Must apply same criteria to all applicants
3. Must document screening criteria beforehand
4. Cannot ask discriminatory questions

**Implementation:**
- Add compliance warnings in UI
- Standardize screening criteria
- Document all decisions
- Provide adverse action notices

### Fair Credit Reporting Act (FCRA) Compliance

**Requirements:**
1. Get written consent before running credit/background checks
2. Provide adverse action notice if denied based on report
3. Give applicant copy of report and rights summary
4. Allow applicant to dispute inaccuracies

**Implementation:**
```jsx
// Consent form in application
<div className="p-4 border rounded bg-gray-50">
  <h4 className="font-bold mb-2">Background & Credit Check Authorization</h4>
  <p className="text-sm mb-4">
    I authorize [Property Management Company] to obtain consumer reports
    including credit reports and criminal background checks in connection
    with this rental application and any subsequent renewals or extensions.
  </p>
  <label className="flex items-center">
    <input type="checkbox" required className="mr-2" />
    <span className="text-sm">I agree to the terms above</span>
  </label>
</div>
```

**Adverse Action Letter Generator:**
```javascript
function generateAdverseActionLetter(application, screening) {
  return {
    to: application.email,
    subject: 'Rental Application Decision',
    body: `
      Dear ${application.firstName} ${application.lastName},

      Thank you for your interest in renting at ${application.propertyName}.

      After careful review of your application and supporting documents,
      we regret to inform you that we are unable to approve your application
      at this time.

      This decision was based in whole or in part on information obtained
      in a consumer report from:

      ${screening.backgroundCheck.provider === 'checkr' ? 'Checkr, Inc.' : screening.creditCheck.provider}

      Under the Fair Credit Reporting Act, you have the right to:
      1. Obtain a free copy of your consumer report within 60 days
      2. Dispute the accuracy or completeness of any information
      3. Add a statement to your file explaining your side

      For questions, please contact us at [contact info].

      Sincerely,
      [Property Management Company]
    `
  };
}
```

### Data Privacy & Security

**Requirements:**
1. Encrypt sensitive data (SSN, DOB)
2. Limit access to authorized personnel
3. Implement data retention policies
4. Secure document storage
5. GDPR compliance (if applicable)

**Implementation:**
```python
# backend-python/services/encryptionService.py

from cryptography.fernet import Fernet
import os

class EncryptionService:
    def __init__(self):
        self.key = os.getenv('ENCRYPTION_KEY').encode()
        self.cipher = Fernet(self.key)

    def encrypt_ssn(self, ssn):
        """Encrypt Social Security Number"""
        return self.cipher.encrypt(ssn.encode()).decode()

    def decrypt_ssn(self, encrypted_ssn):
        """Decrypt Social Security Number"""
        return self.cipher.decrypt(encrypted_ssn.encode()).decode()
```

---

## Testing Strategy

### Unit Tests

```javascript
// __tests__/services/screeningService.test.js

import ScreeningService from '../src/services/screeningService';

describe('ScreeningService', () => {
  test('calculates screening score correctly', () => {
    const screening = {
      backgroundCheck: { result: 'clear' },
      creditCheck: { creditScore: 720, result: 'approved' },
      employmentVerification: { incomeConfirmed: true },
      rentalHistory: { paidOnTime: true }
    };

    const score = ScreeningService.calculateScore(screening);
    expect(score).toBeGreaterThan(80);
  });

  test('requires adverse action for low credit score', () => {
    const screening = {
      creditCheck: { creditScore: 550, result: 'denied' }
    };

    const needsAdverseAction = ScreeningService.requiresAdverseAction(screening);
    expect(needsAdverseAction).toBe(true);
  });
});
```

### Integration Tests

```python
# backend-python/tests/test_applications.py

import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_create_application(client):
    """Test creating a new application"""
    response = client.post('/api/applications', json={
        'firstName': 'John',
        'lastName': 'Doe',
        'email': 'john@example.com',
        'phone': '555-1234',
        'propertyId': 'prop-123',
        # ... other required fields
    })
    assert response.status_code == 201
    assert response.json['status'] == 'submitted'

def test_start_screening(client):
    """Test initiating screening workflow"""
    # Create application first
    app_response = client.post('/api/applications', json={...})
    app_id = app_response.json['id']

    # Start screening
    screening_response = client.post('/api/screening', json={
        'applicationId': app_id,
        'applicantName': 'John Doe'
    })
    assert screening_response.status_code == 201
    assert screening_response.json['status'] == 'pending'
```

### End-to-End Tests (Cypress)

```javascript
// cypress/integration/tenant_application_flow.spec.js

describe('Tenant Application Flow', () => {
  it('completes full application and screening process', () => {
    // Visit application form
    cy.visit('/apply/property-123');

    // Step 1: Personal Info
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').type('john@example.com');
    cy.get('button').contains('Next').click();

    // ... complete all steps

    // Submit application
    cy.get('input[type="checkbox"]').check();
    cy.get('button').contains('Submit').click();

    // Verify confirmation
    cy.contains('Application Submitted Successfully');

    // Admin logs in
    cy.login('admin@example.com', 'password');

    // Views applications
    cy.visit('/applications');
    cy.contains('John Doe').should('be.visible');

    // Starts screening
    cy.contains('John Doe').parent().find('button').contains('Start Screening').click();

    // Completes screening checks
    // ...

    // Approves application
    cy.get('select').select('Approve');
    cy.get('button').contains('Approve & Convert').click();

    // Verifies tenant created
    cy.visit('/tenants');
    cy.contains('John Doe').should('be.visible');
  });
});
```

---

## Summary & Next Steps

### What This Adds to Your Project

1. **Complete Tenant Lifecycle** - From application through approval
2. **Enterprise Feature** - Screening demonstrates complex business logic
3. **Third-Party Integration** - Shows API integration skills
4. **Compliance Awareness** - Fair Housing and FCRA compliance
5. **Data Security** - Encryption and privacy considerations
6. **End-to-End Workflow** - Multi-step process management

### Implementation Roadmap

**Week 1-2:** Core application management (no APIs)
**Week 3:** Manual screening workflow
**Week 4-5:** API integrations (Checkr, TransUnion)
**Week 6:** Compliance features and polish
**Week 7+:** Advanced features

### For Your Resume & Portfolio

**Add to Skills:**
- Third-party API integration (Checkr, TransUnion, Plaid)
- Regulatory compliance (FCRA, Fair Housing Act)
- Data encryption and security
- Multi-step workflow management
- Webhook handling

**Project Pitch Addition:**
"Implemented comprehensive tenant screening with automated background and credit checks via Checkr and TransUnion APIs, ensuring FCRA compliance and Fair Housing Act adherence."

### Resources

- **Checkr API Docs:** https://docs.checkr.com
- **TransUnion SmartMove:** https://www.mysmartmove.com/landlord
- **FCRA Summary:** https://www.ftc.gov/enforcement/statutes/fair-credit-reporting-act
- **Fair Housing Act:** https://www.hud.gov/program_offices/fair_housing_equal_opp/fair_housing_act_overview

Good luck with the implementation! This feature will significantly enhance your project and demonstrate real-world software development capabilities.
