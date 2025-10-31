// src/models/Screening.js

export class Screening {
  constructor(data = {}) {
    // Core Fields
    this.id = data.id || this.generateId();
    this.applicationId = data.applicationId || null;
    this.status = data.status || 'not_started'; // not_started, in_progress, completed

    // Background Check
    this.backgroundCheck = {
      status: data.backgroundCheck?.status || 'not_started',
      completedDate: data.backgroundCheck?.completedDate || null,
      result: data.backgroundCheck?.result || null, // clear, flagged, denied
      criminalHistory: data.backgroundCheck?.criminalHistory || false,
      details: data.backgroundCheck?.details || '',
      provider: data.backgroundCheck?.provider || null,
      reportId: data.backgroundCheck?.reportId || null
    };

    // Credit Check
    this.creditCheck = {
      status: data.creditCheck?.status || 'not_started',
      completedDate: data.creditCheck?.completedDate || null,
      creditScore: data.creditCheck?.creditScore || null,
      result: data.creditCheck?.result || null, // excellent, good, fair, poor
      collections: data.creditCheck?.collections || false,
      bankruptcies: data.creditCheck?.bankruptcies || false,
      evictions: data.creditCheck?.evictions || false,
      details: data.creditCheck?.details || '',
      provider: data.creditCheck?.provider || null,
      reportId: data.creditCheck?.reportId || null
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

    // Rental History Verification
    this.rentalHistory = {
      status: data.rentalHistory?.status || 'not_started',
      currentLandlordContacted: data.rentalHistory?.currentLandlordContacted || false,
      previousLandlordContacted: data.rentalHistory?.previousLandlordContacted || false,
      paidOnTime: data.rentalHistory?.paidOnTime || null, // true, false, null
      propertyCondition: data.rentalHistory?.propertyCondition || null, // excellent, good, fair, poor
      leaseViolations: data.rentalHistory?.leaseViolations || [],
      wouldRentAgain: data.rentalHistory?.wouldRentAgain || null, // true, false, null
      notes: data.rentalHistory?.notes || ''
    };

    // Reference Checks
    this.referenceChecks = data.referenceChecks || [];

    // Document Review
    this.documentReview = {
      idVerified: data.documentReview?.idVerified || false,
      payStubsVerified: data.documentReview?.payStubsVerified || false,
      bankStatementsReviewed: data.documentReview?.bankStatementsReviewed || false,
      proofOfEmployment: data.documentReview?.proofOfEmployment || false,
      notes: data.documentReview?.notes || ''
    };

    // Income Verification
    this.incomeVerification = {
      monthlyIncome: data.incomeVerification?.monthlyIncome || 0,
      proposedRent: data.incomeVerification?.proposedRent || 0,
      rentToIncomeRatio: data.incomeVerification?.rentToIncomeRatio || 0,
      meetsRequirements: data.incomeVerification?.meetsRequirements || false, // Usually 3x rent
      additionalIncome: data.incomeVerification?.additionalIncome || 0,
      notes: data.incomeVerification?.notes || ''
    };

    // Overall Assessment
    this.overallScore = data.overallScore || 0; // 0-100
    this.recommendation = data.recommendation || null; // 'approve', 'conditional', 'reject'
    this.recommendationReason = data.recommendationReason || '';
    this.conditions = data.conditions || []; // Array of conditions if conditional approval
    this.reviewedBy = data.reviewedBy || null;
    this.reviewedDate = data.reviewedDate || null;

    // Decision
    this.decision = data.decision || null; // 'approved', 'rejected', 'conditional'
    this.decisionDate = data.decisionDate || null;
    this.decisionReason = data.decisionReason || '';
    this.decisionBy = data.decisionBy || 'Property Manager';

    // Compliance
    this.adverseActionRequired = data.adverseActionRequired || false;
    this.adverseActionSentDate = data.adverseActionSentDate || null;

    // Timestamps
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  generateId() {
    return `screening_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Calculate completion percentage
  getCompletionPercentage() {
    const checks = [
      this.backgroundCheck.status === 'completed',
      this.creditCheck.status === 'completed',
      this.employmentVerification.status === 'completed',
      this.rentalHistory.status === 'completed',
      this.documentReview.idVerified && this.documentReview.payStubsVerified,
      this.incomeVerification.rentToIncomeRatio > 0
    ];

    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }

  // Calculate rent to income ratio
  calculateRentToIncomeRatio(monthlyIncome, proposedRent, additionalIncome = 0) {
    const totalIncome = monthlyIncome + additionalIncome;
    if (totalIncome === 0) return 0;

    this.incomeVerification.monthlyIncome = monthlyIncome;
    this.incomeVerification.proposedRent = proposedRent;
    this.incomeVerification.additionalIncome = additionalIncome;
    this.incomeVerification.rentToIncomeRatio = (proposedRent / totalIncome) * 100;
    this.incomeVerification.meetsRequirements = this.incomeVerification.rentToIncomeRatio <= 33.33; // 3x rule

    return this.incomeVerification.rentToIncomeRatio;
  }

  // Calculate overall risk score (0-100, higher is better)
  calculateOverallScore() {
    let score = 100;

    // Background check penalties
    if (this.backgroundCheck.result === 'flagged') score -= 15;
    if (this.backgroundCheck.result === 'denied') score -= 30;
    if (this.backgroundCheck.criminalHistory) score -= 10;

    // Credit check penalties
    if (this.creditCheck.creditScore) {
      if (this.creditCheck.creditScore < 580) score -= 30;
      else if (this.creditCheck.creditScore < 620) score -= 20;
      else if (this.creditCheck.creditScore < 660) score -= 10;
    }
    if (this.creditCheck.collections) score -= 10;
    if (this.creditCheck.bankruptcies) score -= 15;
    if (this.creditCheck.evictions) score -= 25;

    // Income verification penalties
    if (!this.incomeVerification.meetsRequirements) score -= 20;
    if (this.incomeVerification.rentToIncomeRatio > 40) score -= 10;

    // Rental history penalties
    if (this.rentalHistory.paidOnTime === false) score -= 20;
    if (this.rentalHistory.wouldRentAgain === false) score -= 15;
    if (this.rentalHistory.leaseViolations.length > 0) score -= (this.rentalHistory.leaseViolations.length * 5);

    // Employment verification bonuses
    if (this.employmentVerification.employerConfirmed &&
        this.employmentVerification.incomeConfirmed) {
      score += 5;
    }

    this.overallScore = Math.max(0, Math.min(100, score));
    return this.overallScore;
  }

  // Generate recommendation based on score
  generateRecommendation() {
    const score = this.calculateOverallScore();

    if (score >= 75) {
      this.recommendation = 'approve';
      this.recommendationReason = 'Strong application with minimal risk factors.';
    } else if (score >= 60) {
      this.recommendation = 'conditional';
      this.recommendationReason = 'Application has some concerns but may be acceptable with conditions.';
      this.conditions = this.suggestConditions();
    } else {
      this.recommendation = 'reject';
      this.recommendationReason = 'Application has significant risk factors.';
      this.adverseActionRequired = true;
    }

    return this.recommendation;
  }

  // Suggest conditions for conditional approval
  suggestConditions() {
    const conditions = [];

    if (!this.incomeVerification.meetsRequirements) {
      conditions.push('Require co-signer or guarantor');
      conditions.push('Increase security deposit by 50%');
    }

    if (this.creditCheck.creditScore && this.creditCheck.creditScore < 650) {
      conditions.push('Increase security deposit');
      conditions.push('Require first and last month rent upfront');
    }

    if (this.creditCheck.collections) {
      conditions.push('Provide proof of payment plan or resolution');
    }

    if (this.rentalHistory.paidOnTime === false) {
      conditions.push('Require automatic rent payment setup');
      conditions.push('Additional security deposit');
    }

    return conditions;
  }

  // Check if screening is complete
  isComplete() {
    return this.getCompletionPercentage() === 100;
  }

  // Validate screening data
  validate() {
    const errors = [];

    if (!this.applicationId) {
      errors.push('Application ID is required');
    }

    if (this.decision && !this.decisionReason) {
      errors.push('Decision reason is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Convert to JSON for storage
  toJSON() {
    return {
      id: this.id,
      applicationId: this.applicationId,
      status: this.status,
      backgroundCheck: this.backgroundCheck,
      creditCheck: this.creditCheck,
      employmentVerification: this.employmentVerification,
      rentalHistory: this.rentalHistory,
      referenceChecks: this.referenceChecks,
      documentReview: this.documentReview,
      incomeVerification: this.incomeVerification,
      overallScore: this.overallScore,
      recommendation: this.recommendation,
      recommendationReason: this.recommendationReason,
      conditions: this.conditions,
      reviewedBy: this.reviewedBy,
      reviewedDate: this.reviewedDate,
      decision: this.decision,
      decisionDate: this.decisionDate,
      decisionReason: this.decisionReason,
      decisionBy: this.decisionBy,
      adverseActionRequired: this.adverseActionRequired,
      adverseActionSentDate: this.adverseActionSentDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default Screening;
