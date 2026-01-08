/**
 * Donation Tracking Service
 * Manage donations, campaigns, and financial transparency
 */

// Donation type
type DonationType = 'money' | 'supplies' | 'equipment' | 'food' | 'clothing' | 'medicine' | 'other';

// Donation status
type DonationStatus = 'pending' | 'confirmed' | 'received' | 'allocated' | 'utilized' | 'refunded';

// Payment method
type PaymentMethod = 'upi' | 'card' | 'net_banking' | 'wallet' | 'cash' | 'cheque' | 'bank_transfer' | 'crypto';

// Campaign status
type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

// Currency
type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

// Donation record
interface Donation {
  id: string;
  type: DonationType;
  campaignId?: string;
  disasterId?: string;
  donor: DonorInfo;
  amount?: MoneyAmount;
  items?: DonatedItem[];
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  receiptNumber: string;
  status: DonationStatus;
  isAnonymous: boolean;
  is80GEligible: boolean;
  certificateId?: string;
  allocations: DonationAllocation[];
  message?: string;
  createdAt: Date;
  confirmedAt?: Date;
  receivedAt?: Date;
  metadata: Record<string, unknown>;
}

// Donor info
interface DonorInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  pan?: string;
  address?: DonorAddress;
  organization?: string;
  type: 'individual' | 'corporate' | 'ngo' | 'government' | 'international';
}

// Donor address
interface DonorAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

// Money amount
interface MoneyAmount {
  value: number;
  currency: Currency;
  exchangeRate?: number;
  inrEquivalent: number;
}

// Donated item
interface DonatedItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedValue?: number;
  condition: 'new' | 'good' | 'usable' | 'needs_repair';
  expiryDate?: Date;
  description?: string;
}

// Donation allocation
interface DonationAllocation {
  id: string;
  targetType: 'disaster' | 'relief_camp' | 'organization' | 'specific_cause';
  targetId: string;
  targetName: string;
  amount?: number;
  items?: { itemId: string; quantity: number }[];
  allocatedAt: Date;
  allocatedBy: string;
  status: 'allocated' | 'in_transit' | 'delivered' | 'utilized';
  utilizationProof?: string[];
}

// Campaign
interface DonationCampaign {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  disasterId?: string;
  disasterName?: string;
  targetAmount: number;
  currency: Currency;
  raisedAmount: number;
  donorCount: number;
  status: CampaignStatus;
  startDate: Date;
  endDate?: Date;
  images: string[];
  videos?: string[];
  organizer: OrganizerInfo;
  beneficiaries: BeneficiaryInfo;
  updates: CampaignUpdate[];
  milestones: CampaignMilestone[];
  categories: string[];
  tags: string[];
  isFeatured: boolean;
  isUrgent: boolean;
  taxBenefits: TaxBenefit[];
  createdAt: Date;
  updatedAt: Date;
}

// Organizer info
interface OrganizerInfo {
  id: string;
  name: string;
  logo?: string;
  description: string;
  website?: string;
  registrationNumber: string;
  is80GRegistered: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

// Beneficiary info
interface BeneficiaryInfo {
  description: string;
  estimatedCount: number;
  location: string;
  categories: string[];
}

// Campaign update
interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  images?: string[];
  postedAt: Date;
  postedBy: string;
}

// Campaign milestone
interface CampaignMilestone {
  id: string;
  title: string;
  targetAmount: number;
  description: string;
  isReached: boolean;
  reachedAt?: Date;
}

// Tax benefit
interface TaxBenefit {
  section: string;
  description: string;
  maxDeduction?: number;
  applicableTo: 'individual' | 'corporate' | 'all';
}

// Expense record
interface ExpenseRecord {
  id: string;
  campaignId?: string;
  disasterId?: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: Currency;
  vendor?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  approvedBy: string;
  approvedAt: Date;
  paidAt?: Date;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  attachments: string[];
  notes?: string;
  createdAt: Date;
}

// Expense category
type ExpenseCategory = 
  | 'relief_supplies'
  | 'medical_aid'
  | 'food_water'
  | 'shelter'
  | 'transportation'
  | 'equipment'
  | 'personnel'
  | 'communication'
  | 'administrative'
  | 'other';

// Financial summary
interface FinancialSummary {
  period: { start: Date; end: Date };
  totalReceived: number;
  totalAllocated: number;
  totalUtilized: number;
  totalExpenses: number;
  balance: number;
  byCategory: { category: string; amount: number }[];
  byDisaster: { disasterId: string; disasterName: string; amount: number }[];
  byCampaign: { campaignId: string; campaignName: string; amount: number }[];
  donorStats: {
    total: number;
    individuals: number;
    corporates: number;
    averageDonation: number;
    repeatDonors: number;
  };
}

// Transparency report
interface TransparencyReport {
  id: string;
  title: string;
  period: { start: Date; end: Date };
  summary: FinancialSummary;
  utilizations: UtilizationReport[];
  impactMetrics: ImpactMetric[];
  auditStatus: 'pending' | 'in_progress' | 'completed';
  auditorName?: string;
  auditReportUrl?: string;
  publishedAt?: Date;
  downloadUrl?: string;
}

// Utilization report
interface UtilizationReport {
  category: string;
  description: string;
  amount: number;
  percentage: number;
  beneficiaries: number;
  proofUrls: string[];
}

// Impact metric
interface ImpactMetric {
  metric: string;
  value: number;
  unit: string;
  description: string;
}

// Donor profile
interface DonorProfile {
  id: string;
  info: DonorInfo;
  totalDonated: number;
  donationCount: number;
  campaigns: string[];
  certificates: Certificate[];
  preferences: DonorPreferences;
  firstDonation: Date;
  lastDonation: Date;
  badges: DonorBadge[];
}

// Certificate
interface Certificate {
  id: string;
  donationId: string;
  type: '80G' | 'appreciation' | 'tax_receipt';
  amount: number;
  issuedAt: Date;
  validFor: string;
  downloadUrl: string;
}

// Donor preferences
interface DonorPreferences {
  communicationFrequency: 'all' | 'important' | 'minimal' | 'none';
  anonymousByDefault: boolean;
  preferredCauses: string[];
  recurringDonation?: RecurringDonation;
}

// Recurring donation
interface RecurringDonation {
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  nextDate: Date;
  isActive: boolean;
  paymentMethodId: string;
}

// Donor badge
interface DonorBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: Date;
}

// Search filters
interface DonationSearchFilters {
  query?: string;
  type?: DonationType[];
  status?: DonationStatus[];
  campaignId?: string;
  disasterId?: string;
  dateRange?: { start: Date; end: Date };
  minAmount?: number;
  maxAmount?: number;
  donorType?: DonorInfo['type'];
  paymentMethod?: PaymentMethod[];
}

// Dashboard stats
interface DonationDashboardStats {
  totalDonations: number;
  totalAmount: number;
  todayAmount: number;
  weekAmount: number;
  monthAmount: number;
  activeCampaigns: number;
  totalDonors: number;
  averageDonation: number;
  byType: { type: DonationType; count: number; amount: number }[];
  byPaymentMethod: { method: PaymentMethod; count: number }[];
  recentDonations: Donation[];
  topCampaigns: { id: string; name: string; raised: number; target: number }[];
}

// Sample data
const EXPENSE_CATEGORIES: { category: ExpenseCategory; name: string; icon: string }[] = [
  { category: 'relief_supplies', name: 'Relief Supplies', icon: '📦' },
  { category: 'medical_aid', name: 'Medical Aid', icon: '🏥' },
  { category: 'food_water', name: 'Food & Water', icon: '🍽️' },
  { category: 'shelter', name: 'Shelter', icon: '🏠' },
  { category: 'transportation', name: 'Transportation', icon: '🚚' },
  { category: 'equipment', name: 'Equipment', icon: '🔧' },
  { category: 'personnel', name: 'Personnel', icon: '👥' },
  { category: 'communication', name: 'Communication', icon: '📱' },
  { category: 'administrative', name: 'Administrative', icon: '📋' },
  { category: 'other', name: 'Other', icon: '📌' },
];

const DONOR_BADGES: Omit<DonorBadge, 'earnedAt'>[] = [
  { id: 'first_donation', name: 'First Step', icon: '🌱', description: 'Made your first donation' },
  { id: 'generous_heart', name: 'Generous Heart', icon: '❤️', description: 'Donated ₹10,000+' },
  { id: 'champion', name: 'Champion', icon: '🏆', description: 'Donated ₹1,00,000+' },
  { id: 'recurring_hero', name: 'Recurring Hero', icon: '🔄', description: 'Set up recurring donation' },
  { id: 'multi_cause', name: 'Multi-Cause Supporter', icon: '🎯', description: 'Supported 5+ campaigns' },
  { id: 'rapid_responder', name: 'Rapid Responder', icon: '⚡', description: 'Donated within 24h of emergency' },
  { id: 'ambassador', name: 'Ambassador', icon: '🌟', description: 'Referred 10+ donors' },
];

class DonationTrackingService {
  private static instance: DonationTrackingService;
  private donations: Map<string, Donation> = new Map();
  private campaigns: Map<string, DonationCampaign> = new Map();
  private expenses: Map<string, ExpenseRecord> = new Map();
  private donors: Map<string, DonorProfile> = new Map();
  private reports: Map<string, TransparencyReport> = new Map();
  private listeners: ((event: string, data: unknown) => void)[] = [];
  private receiptCounter: number = 1000;

  private constructor() {
    this.initializeSampleData();
  }

  public static getInstance(): DonationTrackingService {
    if (!DonationTrackingService.instance) {
      DonationTrackingService.instance = new DonationTrackingService();
    }
    return DonationTrackingService.instance;
  }

  /**
   * Initialize sample data
   */
  private initializeSampleData(): void {
    // Create sample campaigns
    const campaigns: Omit<DonationCampaign, 'updates' | 'milestones'>[] = [
      {
        id: 'camp-001',
        title: 'Kerala Flood Relief 2024',
        description: 'Help affected families rebuild their lives after devastating floods in Kerala.',
        shortDescription: 'Support flood victims in Kerala',
        disasterId: 'disaster-001',
        disasterName: 'Kerala Floods 2024',
        targetAmount: 5000000,
        currency: 'INR',
        raisedAmount: 3250000,
        donorCount: 1250,
        status: 'active',
        startDate: new Date('2024-01-01'),
        images: [],
        organizer: {
          id: 'org-001',
          name: 'Disaster Relief Foundation',
          description: 'Leading disaster relief organization',
          registrationNumber: 'NGO/2010/12345',
          is80GRegistered: true,
          verificationStatus: 'verified',
        },
        beneficiaries: {
          description: 'Flood-affected families in Kerala',
          estimatedCount: 5000,
          location: 'Kerala, India',
          categories: ['families', 'farmers', 'fishermen'],
        },
        categories: ['flood', 'relief', 'rehabilitation'],
        tags: ['kerala', 'flood', 'emergency'],
        isFeatured: true,
        isUrgent: true,
        taxBenefits: [
          { section: '80G', description: '50% deduction on donation amount', applicableTo: 'all' },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
      {
        id: 'camp-002',
        title: 'Cyclone Shelter Construction',
        description: 'Build cyclone-resistant shelters in coastal areas of Odisha.',
        shortDescription: 'Build shelters in Odisha',
        targetAmount: 10000000,
        currency: 'INR',
        raisedAmount: 4500000,
        donorCount: 890,
        status: 'active',
        startDate: new Date('2024-02-01'),
        images: [],
        organizer: {
          id: 'org-002',
          name: 'Coastal Protection Trust',
          description: 'Protecting coastal communities',
          registrationNumber: 'NGO/2015/67890',
          is80GRegistered: true,
          verificationStatus: 'verified',
        },
        beneficiaries: {
          description: 'Coastal communities in Odisha',
          estimatedCount: 10000,
          location: 'Odisha, India',
          categories: ['fishermen', 'coastal communities'],
        },
        categories: ['cyclone', 'infrastructure', 'preparedness'],
        tags: ['odisha', 'cyclone', 'shelter'],
        isFeatured: true,
        isUrgent: false,
        taxBenefits: [
          { section: '80G', description: '50% deduction on donation amount', applicableTo: 'all' },
        ],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date(),
      },
    ];

    campaigns.forEach((c) => {
      this.campaigns.set(c.id, {
        ...c,
        updates: [
          {
            id: `update-${c.id}-1`,
            title: 'Campaign launched',
            content: 'We have launched this campaign to support affected communities.',
            postedAt: c.startDate,
            postedBy: 'Admin',
          },
        ],
        milestones: [
          { id: `ms-${c.id}-1`, title: '25% Goal', targetAmount: c.targetAmount * 0.25, description: 'First milestone', isReached: true, reachedAt: new Date() },
          { id: `ms-${c.id}-2`, title: '50% Goal', targetAmount: c.targetAmount * 0.5, description: 'Halfway there', isReached: c.raisedAmount >= c.targetAmount * 0.5 },
          { id: `ms-${c.id}-3`, title: '75% Goal', targetAmount: c.targetAmount * 0.75, description: 'Almost there', isReached: false },
          { id: `ms-${c.id}-4`, title: '100% Goal', targetAmount: c.targetAmount, description: 'Goal reached', isReached: false },
        ],
      });
    });

    // Create sample donations
    for (let i = 1; i <= 100; i++) {
      const campaignId = i % 2 === 0 ? 'camp-001' : 'camp-002';
      const amount = Math.floor(Math.random() * 50000) + 500;
      const donation: Donation = {
        id: `don-${i.toString().padStart(6, '0')}`,
        type: 'money',
        campaignId,
        donor: {
          id: `donor-${i}`,
          name: `Donor ${i}`,
          email: `donor${i}@example.com`,
          phone: `+91${9000000000 + i}`,
          type: i % 10 === 0 ? 'corporate' : 'individual',
        },
        amount: {
          value: amount,
          currency: 'INR',
          inrEquivalent: amount,
        },
        paymentMethod: (['upi', 'card', 'net_banking'] as PaymentMethod[])[i % 3],
        transactionId: `TXN${Date.now()}${i}`,
        receiptNumber: `RCP-2024-${(1000 + i).toString()}`,
        status: 'confirmed',
        isAnonymous: i % 7 === 0,
        is80GEligible: true,
        allocations: [],
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        confirmedAt: new Date(),
        metadata: {},
      };
      this.donations.set(donation.id, donation);
    }

    // Create sample expenses
    for (let i = 1; i <= 30; i++) {
      const expense: ExpenseRecord = {
        id: `exp-${i.toString().padStart(6, '0')}`,
        campaignId: i % 2 === 0 ? 'camp-001' : 'camp-002',
        category: EXPENSE_CATEGORIES[i % EXPENSE_CATEGORIES.length].category,
        description: `Expense for ${EXPENSE_CATEGORIES[i % EXPENSE_CATEGORIES.length].name}`,
        amount: Math.floor(Math.random() * 100000) + 10000,
        currency: 'INR',
        vendor: `Vendor ${i}`,
        invoiceNumber: `INV-${i}`,
        approvedBy: 'Admin',
        approvedAt: new Date(),
        status: 'paid',
        attachments: [],
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      };
      this.expenses.set(expense.id, expense);
    }
  }

  /**
   * Create donation
   */
  public async createDonation(data: {
    type: DonationType;
    campaignId?: string;
    disasterId?: string;
    donor: Omit<DonorInfo, 'id'>;
    amount?: Omit<MoneyAmount, 'inrEquivalent'>;
    items?: Omit<DonatedItem, 'id'>[];
    paymentMethod?: PaymentMethod;
    isAnonymous?: boolean;
    message?: string;
  }): Promise<Donation> {
    const id = `don-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    const receiptNumber = `RCP-${new Date().getFullYear()}-${++this.receiptCounter}`;

    const donation: Donation = {
      id,
      type: data.type,
      campaignId: data.campaignId,
      disasterId: data.disasterId,
      donor: { ...data.donor, id: `donor-${Date.now()}` },
      amount: data.amount ? { ...data.amount, inrEquivalent: this.convertToINR(data.amount) } : undefined,
      items: data.items?.map((item, i) => ({ ...item, id: `item-${id}-${i}` })),
      paymentMethod: data.paymentMethod,
      receiptNumber,
      status: 'pending',
      isAnonymous: data.isAnonymous || false,
      is80GEligible: data.type === 'money',
      allocations: [],
      message: data.message,
      createdAt: new Date(),
      metadata: {},
    };

    this.donations.set(id, donation);

    // Update campaign if applicable
    if (data.campaignId && data.amount) {
      const campaign = this.campaigns.get(data.campaignId);
      if (campaign) {
        campaign.donorCount++;
      }
    }

    this.emit('donation_created', donation);
    return donation;
  }

  /**
   * Convert to INR
   */
  private convertToINR(amount: Omit<MoneyAmount, 'inrEquivalent'>): number {
    const rates: Record<Currency, number> = { INR: 1, USD: 83, EUR: 90, GBP: 105 };
    return amount.value * (rates[amount.currency] || 1);
  }

  /**
   * Confirm donation
   */
  public confirmDonation(donationId: string, transactionId?: string): Donation | null {
    const donation = this.donations.get(donationId);
    if (!donation || donation.status !== 'pending') return null;

    donation.status = 'confirmed';
    donation.confirmedAt = new Date();
    if (transactionId) donation.transactionId = transactionId;

    // Update campaign
    if (donation.campaignId && donation.amount) {
      const campaign = this.campaigns.get(donation.campaignId);
      if (campaign) {
        campaign.raisedAmount += donation.amount.inrEquivalent;
        campaign.updatedAt = new Date();

        // Check milestones
        campaign.milestones.forEach((m) => {
          if (!m.isReached && campaign.raisedAmount >= m.targetAmount) {
            m.isReached = true;
            m.reachedAt = new Date();
          }
        });
      }
    }

    this.emit('donation_confirmed', donation);
    return donation;
  }

  /**
   * Get donation
   */
  public getDonation(donationId: string): Donation | undefined {
    return this.donations.get(donationId);
  }

  /**
   * Search donations
   */
  public async searchDonations(filters: DonationSearchFilters, page: number = 1, pageSize: number = 20): Promise<{ donations: Donation[]; total: number }> {
    let results = Array.from(this.donations.values());

    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter((d) =>
        d.donor.name.toLowerCase().includes(query) ||
        d.receiptNumber.toLowerCase().includes(query) ||
        d.transactionId?.toLowerCase().includes(query)
      );
    }

    if (filters.type?.length) {
      results = results.filter((d) => filters.type!.includes(d.type));
    }

    if (filters.status?.length) {
      results = results.filter((d) => filters.status!.includes(d.status));
    }

    if (filters.campaignId) {
      results = results.filter((d) => d.campaignId === filters.campaignId);
    }

    if (filters.disasterId) {
      results = results.filter((d) => d.disasterId === filters.disasterId);
    }

    if (filters.dateRange) {
      results = results.filter((d) => {
        return d.createdAt >= filters.dateRange!.start && d.createdAt <= filters.dateRange!.end;
      });
    }

    if (filters.minAmount !== undefined && filters.minAmount > 0) {
      results = results.filter((d) => d.amount && d.amount.inrEquivalent >= filters.minAmount!);
    }

    if (filters.maxAmount !== undefined) {
      results = results.filter((d) => d.amount && d.amount.inrEquivalent <= filters.maxAmount!);
    }

    if (filters.donorType) {
      results = results.filter((d) => d.donor.type === filters.donorType);
    }

    if (filters.paymentMethod?.length) {
      results = results.filter((d) => d.paymentMethod && filters.paymentMethod!.includes(d.paymentMethod));
    }

    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = results.length;
    const startIndex = (page - 1) * pageSize;
    return { donations: results.slice(startIndex, startIndex + pageSize), total };
  }

  /**
   * Allocate donation
   */
  public allocateDonation(donationId: string, allocation: Omit<DonationAllocation, 'id' | 'allocatedAt' | 'status'>): boolean {
    const donation = this.donations.get(donationId);
    if (!donation || donation.status !== 'confirmed') return false;

    donation.allocations.push({
      ...allocation,
      id: `alloc-${Date.now()}`,
      allocatedAt: new Date(),
      status: 'allocated',
    });

    donation.status = 'allocated';
    this.emit('donation_allocated', { donationId, allocation });
    return true;
  }

  /**
   * Create campaign
   */
  public async createCampaign(data: Omit<DonationCampaign, 'id' | 'raisedAmount' | 'donorCount' | 'status' | 'updates' | 'milestones' | 'createdAt' | 'updatedAt'>): Promise<DonationCampaign> {
    const id = `camp-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    const campaign: DonationCampaign = {
      ...data,
      id,
      raisedAmount: 0,
      donorCount: 0,
      status: 'draft',
      updates: [],
      milestones: [
        { id: `ms-${id}-1`, title: '25% Goal', targetAmount: data.targetAmount * 0.25, description: 'First milestone', isReached: false },
        { id: `ms-${id}-2`, title: '50% Goal', targetAmount: data.targetAmount * 0.5, description: 'Halfway there', isReached: false },
        { id: `ms-${id}-3`, title: '75% Goal', targetAmount: data.targetAmount * 0.75, description: 'Almost there', isReached: false },
        { id: `ms-${id}-4`, title: '100% Goal', targetAmount: data.targetAmount, description: 'Goal reached', isReached: false },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.campaigns.set(id, campaign);
    this.emit('campaign_created', campaign);
    return campaign;
  }

  /**
   * Get campaign
   */
  public getCampaign(campaignId: string): DonationCampaign | undefined {
    return this.campaigns.get(campaignId);
  }

  /**
   * Get active campaigns
   */
  public getActiveCampaigns(): DonationCampaign[] {
    return Array.from(this.campaigns.values())
      .filter((c) => c.status === 'active')
      .sort((a, b) => {
        if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }

  /**
   * Update campaign status
   */
  public updateCampaignStatus(campaignId: string, status: CampaignStatus): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;

    campaign.status = status;
    campaign.updatedAt = new Date();
    this.emit('campaign_status_updated', { campaignId, status });
    return true;
  }

  /**
   * Add campaign update
   */
  public addCampaignUpdate(campaignId: string, update: Omit<CampaignUpdate, 'id' | 'postedAt'>): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;

    campaign.updates.push({
      ...update,
      id: `update-${Date.now()}`,
      postedAt: new Date(),
    });
    campaign.updatedAt = new Date();

    this.emit('campaign_update_added', { campaignId, update });
    return true;
  }

  /**
   * Create expense
   */
  public async createExpense(data: Omit<ExpenseRecord, 'id' | 'status' | 'createdAt'>): Promise<ExpenseRecord> {
    const id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    const expense: ExpenseRecord = {
      ...data,
      id,
      status: 'pending',
      createdAt: new Date(),
    };

    this.expenses.set(id, expense);
    this.emit('expense_created', expense);
    return expense;
  }

  /**
   * Approve expense
   */
  public approveExpense(expenseId: string, approvedBy: string): boolean {
    const expense = this.expenses.get(expenseId);
    if (!expense || expense.status !== 'pending') return false;

    expense.status = 'approved';
    expense.approvedBy = approvedBy;
    expense.approvedAt = new Date();

    this.emit('expense_approved', expense);
    return true;
  }

  /**
   * Get expenses
   */
  public getExpenses(filters?: { campaignId?: string; disasterId?: string; category?: ExpenseCategory; status?: ExpenseRecord['status'] }): ExpenseRecord[] {
    let results = Array.from(this.expenses.values());

    if (filters?.campaignId) {
      results = results.filter((e) => e.campaignId === filters.campaignId);
    }

    if (filters?.disasterId) {
      results = results.filter((e) => e.disasterId === filters.disasterId);
    }

    if (filters?.category) {
      results = results.filter((e) => e.category === filters.category);
    }

    if (filters?.status) {
      results = results.filter((e) => e.status === filters.status);
    }

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get financial summary
   */
  public getFinancialSummary(period: { start: Date; end: Date }): FinancialSummary {
    const donations = Array.from(this.donations.values()).filter((d) =>
      d.status === 'confirmed' && d.createdAt >= period.start && d.createdAt <= period.end
    );

    const expenses = Array.from(this.expenses.values()).filter((e) =>
      e.status === 'paid' && e.createdAt >= period.start && e.createdAt <= period.end
    );

    const totalReceived = donations.reduce((sum, d) => sum + (d.amount?.inrEquivalent || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const byCategory = new Map<string, number>();
    expenses.forEach((e) => {
      byCategory.set(e.category, (byCategory.get(e.category) || 0) + e.amount);
    });

    const byDisaster = new Map<string, { name: string; amount: number }>();
    donations.forEach((d) => {
      if (d.disasterId) {
        const existing = byDisaster.get(d.disasterId) || { name: 'Disaster', amount: 0 };
        existing.amount += d.amount?.inrEquivalent || 0;
        byDisaster.set(d.disasterId, existing);
      }
    });

    const byCampaign = new Map<string, { name: string; amount: number }>();
    donations.forEach((d) => {
      if (d.campaignId) {
        const campaign = this.campaigns.get(d.campaignId);
        const existing = byCampaign.get(d.campaignId) || { name: campaign?.title || 'Campaign', amount: 0 };
        existing.amount += d.amount?.inrEquivalent || 0;
        byCampaign.set(d.campaignId, existing);
      }
    });

    const uniqueDonors = new Set(donations.map((d) => d.donor.id));
    const individuals = donations.filter((d) => d.donor.type === 'individual').length;
    const corporates = donations.filter((d) => d.donor.type === 'corporate').length;

    return {
      period,
      totalReceived,
      totalAllocated: donations.filter((d) => d.status === 'allocated').reduce((sum, d) => sum + (d.amount?.inrEquivalent || 0), 0),
      totalUtilized: donations.filter((d) => d.status === 'utilized').reduce((sum, d) => sum + (d.amount?.inrEquivalent || 0), 0),
      totalExpenses,
      balance: totalReceived - totalExpenses,
      byCategory: Array.from(byCategory.entries()).map(([category, amount]) => ({ category, amount })),
      byDisaster: Array.from(byDisaster.entries()).map(([disasterId, { name, amount }]) => ({ disasterId, disasterName: name, amount })),
      byCampaign: Array.from(byCampaign.entries()).map(([campaignId, { name, amount }]) => ({ campaignId, campaignName: name, amount })),
      donorStats: {
        total: uniqueDonors.size,
        individuals,
        corporates,
        averageDonation: donations.length > 0 ? totalReceived / donations.length : 0,
        repeatDonors: 0, // Would need historical data
      },
    };
  }

  /**
   * Generate transparency report
   */
  public async generateTransparencyReport(period: { start: Date; end: Date }): Promise<TransparencyReport> {
    const id = `report-${Date.now()}`;
    const summary = this.getFinancialSummary(period);

    const report: TransparencyReport = {
      id,
      title: `Transparency Report - ${period.start.toLocaleDateString()} to ${period.end.toLocaleDateString()}`,
      period,
      summary,
      utilizations: summary.byCategory.map((cat) => ({
        category: cat.category,
        description: `Funds utilized for ${cat.category}`,
        amount: cat.amount,
        percentage: summary.totalExpenses > 0 ? (cat.amount / summary.totalExpenses) * 100 : 0,
        beneficiaries: Math.floor(cat.amount / 1000),
        proofUrls: [],
      })),
      impactMetrics: [
        { metric: 'Families Helped', value: Math.floor(summary.totalReceived / 5000), unit: 'families', description: 'Families provided relief assistance' },
        { metric: 'Meals Distributed', value: Math.floor(summary.totalReceived / 100), unit: 'meals', description: 'Meals distributed to affected people' },
        { metric: 'Medical Kits', value: Math.floor(summary.totalReceived / 2000), unit: 'kits', description: 'Medical kits distributed' },
      ],
      auditStatus: 'pending',
    };

    this.reports.set(id, report);
    return report;
  }

  /**
   * Generate certificate
   */
  public generateCertificate(donationId: string): Certificate | null {
    const donation = this.donations.get(donationId);
    if (!donation || !donation.is80GEligible || donation.status !== 'confirmed') return null;

    const certificate: Certificate = {
      id: `cert-${Date.now()}`,
      donationId,
      type: '80G',
      amount: donation.amount?.inrEquivalent || 0,
      issuedAt: new Date(),
      validFor: `FY ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      downloadUrl: `/certificates/${donationId}/80g.pdf`,
    };

    donation.certificateId = certificate.id;
    return certificate;
  }

  /**
   * Get dashboard stats
   */
  public getDashboardStats(): DonationDashboardStats {
    const donations = Array.from(this.donations.values()).filter((d) => d.status === 'confirmed');
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalAmount = donations.reduce((sum, d) => sum + (d.amount?.inrEquivalent || 0), 0);
    const todayDonations = donations.filter((d) => d.createdAt >= todayStart);
    const weekDonations = donations.filter((d) => d.createdAt >= weekStart);
    const monthDonations = donations.filter((d) => d.createdAt >= monthStart);

    const byType = new Map<DonationType, { count: number; amount: number }>();
    const byPaymentMethod = new Map<PaymentMethod, number>();

    donations.forEach((d) => {
      const typeData = byType.get(d.type) || { count: 0, amount: 0 };
      typeData.count++;
      typeData.amount += d.amount?.inrEquivalent || 0;
      byType.set(d.type, typeData);

      if (d.paymentMethod) {
        byPaymentMethod.set(d.paymentMethod, (byPaymentMethod.get(d.paymentMethod) || 0) + 1);
      }
    });

    const uniqueDonors = new Set(donations.map((d) => d.donor.id));

    return {
      totalDonations: donations.length,
      totalAmount,
      todayAmount: todayDonations.reduce((sum, d) => sum + (d.amount?.inrEquivalent || 0), 0),
      weekAmount: weekDonations.reduce((sum, d) => sum + (d.amount?.inrEquivalent || 0), 0),
      monthAmount: monthDonations.reduce((sum, d) => sum + (d.amount?.inrEquivalent || 0), 0),
      activeCampaigns: Array.from(this.campaigns.values()).filter((c) => c.status === 'active').length,
      totalDonors: uniqueDonors.size,
      averageDonation: donations.length > 0 ? totalAmount / donations.length : 0,
      byType: Array.from(byType.entries()).map(([type, data]) => ({ type, ...data })),
      byPaymentMethod: Array.from(byPaymentMethod.entries()).map(([method, count]) => ({ method, count })),
      recentDonations: donations.slice(0, 10),
      topCampaigns: Array.from(this.campaigns.values())
        .filter((c) => c.status === 'active')
        .sort((a, b) => b.raisedAmount - a.raisedAmount)
        .slice(0, 5)
        .map((c) => ({ id: c.id, name: c.title, raised: c.raisedAmount, target: c.targetAmount })),
    };
  }

  /**
   * Subscribe to events
   */
  public subscribe(callback: (event: string, data: unknown) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  /**
   * Emit event
   */
  private emit(event: string, data: unknown): void {
    this.listeners.forEach((callback) => callback(event, data));
  }
}

export const donationTrackingService = DonationTrackingService.getInstance();
export type {
  DonationType,
  DonationStatus,
  PaymentMethod,
  CampaignStatus,
  Currency,
  Donation,
  DonorInfo,
  DonorAddress,
  MoneyAmount,
  DonatedItem,
  DonationAllocation,
  DonationCampaign,
  OrganizerInfo,
  BeneficiaryInfo,
  CampaignUpdate,
  CampaignMilestone,
  TaxBenefit,
  ExpenseRecord,
  ExpenseCategory,
  FinancialSummary,
  TransparencyReport,
  UtilizationReport,
  ImpactMetric,
  DonorProfile,
  Certificate,
  DonorPreferences,
  RecurringDonation,
  DonorBadge,
  DonationSearchFilters,
  DonationDashboardStats,
};
