// src/models/Application.js

/**
 * Application Model
 * Represents a tenant application for a rental property
 */

export class Application {
  constructor(data = {}) {
    // Core ID and Status
    this.id = data.id || this.generateId();
    this.status = data.status || 'submitted'; // submitted, screening, approved, rejected, withdrawn
    this.submittedDate = data.submittedDate || new Date().toISOString();

    // Personal Information
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.dateOfBirth = data.dateOfBirth || '';
    this.ssn = data.ssn || ''; // Last 4 digits only for display

    // Application Details
    this.propertyId = data.propertyId || '';
    this.propertyName = data.propertyName || '';
    this.desiredUnit = data.desiredUnit || '';
    this.desiredMoveInDate = data.desiredMoveInDate || '';
    this.leaseTerm = data.leaseTerm || 12; // months

    // Employment Information
    this.currentEmployer = data.currentEmployer || '';
    this.jobTitle = data.jobTitle || '';
    this.employmentStartDate = data.employmentStartDate || '';
    this.monthlyIncome = data.monthlyIncome || 0;
    this.employerPhone = data.employerPhone || '';

    // Additional Income Sources
    this.additionalIncome = data.additionalIncome || [];

    // Current Address
    this.currentAddress = {
      street: data.currentAddress?.street || '',
      city: data.currentAddress?.city || '',
      state: data.currentAddress?.state || '',
      zip: data.currentAddress?.zip || '',
      landlordName: data.currentAddress?.landlordName || '',
      landlordPhone: data.currentAddress?.landlordPhone || '',
      monthlyRent: data.currentAddress?.monthlyRent || 0,
      moveInDate: data.currentAddress?.moveInDate || ''
    };

    // Previous Addresses (if current < 2 years)
    this.previousAddresses = data.previousAddresses || [];

    // Emergency Contact
    this.emergencyContact = {
      name: data.emergencyContact?.name || '',
      relationship: data.emergencyContact?.relationship || '',
      phone: data.emergencyContact?.phone || ''
    };

    // Personal References
    this.personalReferences = data.personalReferences || [
      { name: '', relationship: '', phone: '', email: '' }
    ];

    // Occupants (including applicant)
    this.occupants = data.occupants || [];

    // Pets
    this.pets = data.pets || [];

    // Vehicles
    this.vehicles = data.vehicles || [];

    // Background Disclosures
    this.hasEvictions = data.hasEvictions || false;
    this.hasBankruptcy = data.hasBankruptcy || false;
    this.hasCriminalHistory = data.hasCriminalHistory || false;
    this.disclosureNotes = data.disclosureNotes || '';

    // Consent and Signatures
    this.backgroundCheckConsent = data.backgroundCheckConsent || false;
    this.creditCheckConsent = data.creditCheckConsent || false;
    this.consentSignature = data.consentSignature || '';
    this.consentDate = data.consentDate || null;

    // Document References
    this.documents = data.documents || []; // Array of document IDs

    // Admin Fields
    this.screeningId = data.screeningId || null;
    this.reviewedBy = data.reviewedBy || null;
    this.reviewedDate = data.reviewedDate || null;
    this.decisionReason = data.decisionReason || '';
    this.tenantId = data.tenantId || null; // Set when converted to tenant

    // Timestamps
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Generate unique ID
  generateId() {
    return Date.now();
  }

  // Get full name
  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  // Get formatted move-in date
  get formattedMoveInDate() {
    if (!this.desiredMoveInDate) return 'N/A';
    return new Date(this.desiredMoveInDate).toLocaleDateString();
  }

  // Get formatted submitted date
  get formattedSubmittedDate() {
    if (!this.submittedDate) return 'N/A';
    return new Date(this.submittedDate).toLocaleDateString();
  }

  // Get status badge color
  get statusColor() {
    const colors = {
      submitted: 'blue',
      screening: 'yellow',
      approved: 'green',
      rejected: 'red',
      withdrawn: 'gray'
    };
    return colors[this.status] || 'gray';
  }

  // Check if application is complete
  isComplete() {
    return !!(
      this.firstName &&
      this.lastName &&
      this.email &&
      this.phone &&
      this.dateOfBirth &&
      this.propertyId &&
      this.desiredMoveInDate &&
      this.currentEmployer &&
      this.monthlyIncome &&
      this.currentAddress.street &&
      this.emergencyContact.name &&
      this.backgroundCheckConsent &&
      this.creditCheckConsent &&
      this.consentSignature
    );
  }

  // Validate application data
  validate() {
    const errors = [];

    // Personal Information
    if (!this.firstName) errors.push('First name is required');
    if (!this.lastName) errors.push('Last name is required');
    if (!this.email) errors.push('Email is required');
    if (!this.phone) errors.push('Phone number is required');
    if (!this.dateOfBirth) errors.push('Date of birth is required');

    // Application Details
    if (!this.propertyId) errors.push('Property is required');
    if (!this.desiredMoveInDate) errors.push('Desired move-in date is required');

    // Employment
    if (!this.currentEmployer) errors.push('Current employer is required');
    if (!this.monthlyIncome || this.monthlyIncome <= 0) {
      errors.push('Monthly income is required');
    }

    // Address
    if (!this.currentAddress.street) errors.push('Current address is required');
    if (!this.currentAddress.city) errors.push('City is required');
    if (!this.currentAddress.state) errors.push('State is required');
    if (!this.currentAddress.zip) errors.push('Zip code is required');

    // Emergency Contact
    if (!this.emergencyContact.name) errors.push('Emergency contact name is required');
    if (!this.emergencyContact.phone) errors.push('Emergency contact phone is required');

    // Consent
    if (!this.backgroundCheckConsent) {
      errors.push('Background check consent is required');
    }
    if (!this.creditCheckConsent) {
      errors.push('Credit check consent is required');
    }
    if (!this.consentSignature) {
      errors.push('Electronic signature is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Calculate rent-to-income ratio
  getRentToIncomeRatio(rentAmount) {
    if (!this.monthlyIncome || this.monthlyIncome <= 0) return 0;
    return (rentAmount / this.monthlyIncome) * 100;
  }

  // Check if income meets requirements (typically 3x rent)
  meetsIncomeRequirement(rentAmount, multiplier = 3) {
    return this.monthlyIncome >= (rentAmount * multiplier);
  }

  // Convert to plain object for storage
  toJSON() {
    return {
      id: this.id,
      status: this.status,
      submittedDate: this.submittedDate,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      dateOfBirth: this.dateOfBirth,
      ssn: this.ssn,
      propertyId: this.propertyId,
      propertyName: this.propertyName,
      desiredUnit: this.desiredUnit,
      desiredMoveInDate: this.desiredMoveInDate,
      leaseTerm: this.leaseTerm,
      currentEmployer: this.currentEmployer,
      jobTitle: this.jobTitle,
      employmentStartDate: this.employmentStartDate,
      monthlyIncome: this.monthlyIncome,
      employerPhone: this.employerPhone,
      additionalIncome: this.additionalIncome,
      currentAddress: this.currentAddress,
      previousAddresses: this.previousAddresses,
      emergencyContact: this.emergencyContact,
      personalReferences: this.personalReferences,
      occupants: this.occupants,
      pets: this.pets,
      vehicles: this.vehicles,
      hasEvictions: this.hasEvictions,
      hasBankruptcy: this.hasBankruptcy,
      hasCriminalHistory: this.hasCriminalHistory,
      disclosureNotes: this.disclosureNotes,
      backgroundCheckConsent: this.backgroundCheckConsent,
      creditCheckConsent: this.creditCheckConsent,
      consentSignature: this.consentSignature,
      consentDate: this.consentDate,
      documents: this.documents,
      screeningId: this.screeningId,
      reviewedBy: this.reviewedBy,
      reviewedDate: this.reviewedDate,
      decisionReason: this.decisionReason,
      tenantId: this.tenantId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Create from plain object
  static fromJSON(data) {
    return new Application(data);
  }
}

export default Application;
