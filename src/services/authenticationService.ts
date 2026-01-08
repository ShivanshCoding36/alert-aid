/**
 * Authentication Service
 * Comprehensive user authentication and session management
 */

// Auth provider type
type AuthProvider = 'email' | 'phone' | 'google' | 'facebook' | 'apple' | 'aadhaar' | 'digilocker';

// User role
type UserRole = 'super_admin' | 'admin' | 'official' | 'coordinator' | 'volunteer' | 'user' | 'guest';

// Permission
type Permission = 
  | 'alerts:create'
  | 'alerts:read'
  | 'alerts:update'
  | 'alerts:delete'
  | 'users:manage'
  | 'users:read'
  | 'volunteers:manage'
  | 'donations:manage'
  | 'reports:generate'
  | 'settings:manage'
  | 'camps:manage'
  | 'supplies:manage'
  | 'analytics:view';

// Token type
type TokenType = 'access' | 'refresh' | 'reset_password' | 'email_verification' | 'phone_verification';

// MFA method
type MFAMethod = 'sms' | 'email' | 'authenticator' | 'backup_codes';

// Session status
type SessionStatus = 'active' | 'expired' | 'revoked' | 'locked';

// Account status
type AccountStatus = 'pending' | 'active' | 'suspended' | 'locked' | 'deactivated' | 'deleted';

// User account
interface UserAccount {
  id: string;
  email?: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  passwordHash?: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  status: AccountStatus;
  providers: AuthProviderLink[];
  mfa: MFASettings;
  security: SecuritySettings;
  profile: UserProfile;
  metadata: UserMetadata;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  lastPasswordChange?: Date;
}

// Auth provider link
interface AuthProviderLink {
  provider: AuthProvider;
  providerId: string;
  email?: string;
  displayName?: string;
  linkedAt: Date;
  lastUsed?: Date;
}

// MFA settings
interface MFASettings {
  isEnabled: boolean;
  methods: MFAMethod[];
  primaryMethod?: MFAMethod;
  backupCodes?: string[];
  recoveryEmail?: string;
  recoveryPhone?: string;
  totpSecret?: string;
  lastVerified?: Date;
}

// Security settings
interface SecuritySettings {
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
  trustedDevices: TrustedDevice[];
  allowedIPs?: string[];
  maxSessions: number;
  sessionTimeout: number; // in minutes
  requireMFAForSensitive: boolean;
  passwordPolicy: PasswordPolicy;
}

// Trusted device
interface TrustedDevice {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'other';
  browser?: string;
  os?: string;
  fingerprint: string;
  lastUsed: Date;
  addedAt: Date;
  location?: string;
}

// Password policy
interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecial: boolean;
  preventReuse: number;
  maxAge: number; // in days
}

// User profile
interface UserProfile {
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_say';
  address?: ProfileAddress;
  organization?: string;
  designation?: string;
  emergencyContact?: EmergencyContact;
  languages: string[];
  timezone: string;
  locale: string;
}

// Profile address
interface ProfileAddress {
  street: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  coordinates?: { lat: number; lng: number };
}

// Emergency contact
interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
}

// User metadata
interface UserMetadata {
  registrationSource: string;
  referralCode?: string;
  marketingConsent: boolean;
  dataProcessingConsent: boolean;
  termsAcceptedAt?: Date;
  privacyAcceptedAt?: Date;
  lastTermsVersion?: string;
  customFields?: Record<string, unknown>;
}

// Auth session
interface AuthSession {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  location?: SessionLocation;
  status: SessionStatus;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  mfaVerified: boolean;
  riskScore: number;
}

// Device info
interface DeviceInfo {
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'other';
  isMobile: boolean;
  fingerprint?: string;
}

// Session location
interface SessionLocation {
  country: string;
  region: string;
  city: string;
  coordinates?: { lat: number; lng: number };
  timezone: string;
}

// Auth token
interface AuthToken {
  token: string;
  type: TokenType;
  userId: string;
  expiresAt: Date;
  issuedAt: Date;
  deviceId?: string;
  scope?: string[];
  isRevoked: boolean;
}

// Login attempt
interface LoginAttempt {
  id: string;
  userId?: string;
  email?: string;
  phone?: string;
  ipAddress: string;
  deviceInfo: DeviceInfo;
  success: boolean;
  failureReason?: string;
  timestamp: Date;
  location?: SessionLocation;
  provider: AuthProvider;
  riskFactors?: string[];
}

// Security event
interface SecurityEvent {
  id: string;
  userId: string;
  type: SecurityEventType;
  description: string;
  ipAddress: string;
  deviceInfo?: DeviceInfo;
  location?: SessionLocation;
  metadata?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

// Security event type
type SecurityEventType = 
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'password_changed'
  | 'password_reset'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'mfa_verified'
  | 'session_revoked'
  | 'account_locked'
  | 'account_unlocked'
  | 'permissions_changed'
  | 'suspicious_activity'
  | 'new_device'
  | 'location_change';

// Auth result
interface AuthResult {
  success: boolean;
  user?: UserAccount;
  accessToken?: string;
  refreshToken?: string;
  sessionId?: string;
  expiresIn?: number;
  mfaRequired?: boolean;
  mfaToken?: string;
  error?: AuthError;
}

// Auth error
interface AuthError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Registration data
interface RegistrationData {
  email?: string;
  phone?: string;
  password?: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  provider: AuthProvider;
  providerId?: string;
  metadata?: Partial<UserMetadata>;
}

// Role permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'alerts:create', 'alerts:read', 'alerts:update', 'alerts:delete',
    'users:manage', 'users:read',
    'volunteers:manage', 'donations:manage',
    'reports:generate', 'settings:manage',
    'camps:manage', 'supplies:manage', 'analytics:view',
  ],
  admin: [
    'alerts:create', 'alerts:read', 'alerts:update', 'alerts:delete',
    'users:read', 'volunteers:manage', 'donations:manage',
    'reports:generate', 'camps:manage', 'supplies:manage', 'analytics:view',
  ],
  official: [
    'alerts:create', 'alerts:read', 'alerts:update',
    'users:read', 'volunteers:manage',
    'reports:generate', 'camps:manage', 'supplies:manage', 'analytics:view',
  ],
  coordinator: [
    'alerts:read', 'alerts:update',
    'users:read', 'volunteers:manage',
    'camps:manage', 'supplies:manage', 'analytics:view',
  ],
  volunteer: [
    'alerts:read',
    'camps:manage',
  ],
  user: [
    'alerts:read',
  ],
  guest: [],
};

// Default password policy
const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecial: true,
  preventReuse: 5,
  maxAge: 90,
};

class AuthenticationService {
  private static instance: AuthenticationService;
  private users: Map<string, UserAccount> = new Map();
  private sessions: Map<string, AuthSession> = new Map();
  private tokens: Map<string, AuthToken> = new Map();
  private loginAttempts: LoginAttempt[] = [];
  private securityEvents: SecurityEvent[] = [];
  private listeners: ((event: string, data: unknown) => void)[] = [];
  private currentUser: UserAccount | null = null;
  private currentSession: AuthSession | null = null;

  private constructor() {
    this.initializeSampleData();
  }

  public static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  /**
   * Initialize sample data
   */
  private initializeSampleData(): void {
    // Create sample users
    const roles: UserRole[] = ['super_admin', 'admin', 'official', 'coordinator', 'volunteer', 'user'];
    
    for (let i = 1; i <= 20; i++) {
      const role = roles[i % roles.length];
      const user: UserAccount = {
        id: `user-${i.toString().padStart(6, '0')}`,
        email: `user${i}@example.com`,
        emailVerified: i % 3 !== 0,
        phone: `+91${9000000000 + i}`,
        phoneVerified: i % 2 === 0,
        passwordHash: this.hashPassword('Password123!'),
        displayName: `User ${i}`,
        firstName: `First${i}`,
        lastName: `Last${i}`,
        role,
        permissions: ROLE_PERMISSIONS[role],
        status: i % 10 === 0 ? 'suspended' : 'active',
        providers: [{ provider: 'email', providerId: `user${i}@example.com`, linkedAt: new Date() }],
        mfa: {
          isEnabled: i % 4 === 0,
          methods: i % 4 === 0 ? ['sms', 'email'] : [],
          primaryMethod: i % 4 === 0 ? 'sms' : undefined,
        },
        security: {
          loginNotifications: true,
          suspiciousActivityAlerts: true,
          trustedDevices: [],
          maxSessions: 5,
          sessionTimeout: 60,
          requireMFAForSensitive: i % 3 === 0,
          passwordPolicy: DEFAULT_PASSWORD_POLICY,
        },
        profile: {
          languages: ['en', 'hi'],
          timezone: 'Asia/Kolkata',
          locale: 'en-IN',
        },
        metadata: {
          registrationSource: 'web',
          marketingConsent: true,
          dataProcessingConsent: true,
          termsAcceptedAt: new Date(),
          privacyAcceptedAt: new Date(),
        },
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        lastLoginAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      };
      this.users.set(user.id, user);
    }
  }

  /**
   * Hash password (simplified for demo)
   */
  private hashPassword(password: string): string {
    // In production, use bcrypt or argon2
    return Buffer.from(password).toString('base64');
  }

  /**
   * Verify password
   */
  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  /**
   * Generate token
   */
  private generateToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  /**
   * Validate password against policy
   */
  private validatePassword(password: string, policy: PasswordPolicy): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Register user
   */
  public async register(data: RegistrationData): Promise<AuthResult> {
    // Check if email/phone already exists
    if (data.email) {
      const existingEmail = Array.from(this.users.values()).find((u) => u.email === data.email);
      if (existingEmail) {
        return { success: false, error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } };
      }
    }

    if (data.phone) {
      const existingPhone = Array.from(this.users.values()).find((u) => u.phone === data.phone);
      if (existingPhone) {
        return { success: false, error: { code: 'PHONE_EXISTS', message: 'Phone already registered' } };
      }
    }

    // Validate password if provided
    if (data.password) {
      const validation = this.validatePassword(data.password, DEFAULT_PASSWORD_POLICY);
      if (!validation.valid) {
        return { success: false, error: { code: 'WEAK_PASSWORD', message: validation.errors.join(', ') } };
      }
    }

    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    const user: UserAccount = {
      id,
      email: data.email,
      emailVerified: false,
      phone: data.phone,
      phoneVerified: false,
      passwordHash: data.password ? this.hashPassword(data.password) : undefined,
      displayName: data.displayName,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'user',
      permissions: ROLE_PERMISSIONS.user,
      status: 'pending',
      providers: data.provider ? [{ provider: data.provider, providerId: data.providerId || data.email || data.phone || '', linkedAt: new Date() }] : [],
      mfa: { isEnabled: false, methods: [] },
      security: {
        loginNotifications: true,
        suspiciousActivityAlerts: true,
        trustedDevices: [],
        maxSessions: 5,
        sessionTimeout: 60,
        requireMFAForSensitive: false,
        passwordPolicy: DEFAULT_PASSWORD_POLICY,
      },
      profile: {
        languages: ['en'],
        timezone: 'Asia/Kolkata',
        locale: 'en-IN',
      },
      metadata: {
        registrationSource: 'web',
        marketingConsent: data.metadata?.marketingConsent ?? false,
        dataProcessingConsent: data.metadata?.dataProcessingConsent ?? true,
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(id, user);

    // Send verification
    if (data.email) {
      await this.sendEmailVerification(id);
    }

    if (data.phone) {
      await this.sendPhoneVerification(id);
    }

    this.emit('user_registered', user);
    return { success: true, user };
  }

  /**
   * Login with email/password
   */
  public async loginWithEmail(email: string, password: string, deviceInfo: DeviceInfo, ipAddress: string): Promise<AuthResult> {
    const user = Array.from(this.users.values()).find((u) => u.email === email);
    
    const attempt: LoginAttempt = {
      id: `attempt-${Date.now()}`,
      email,
      ipAddress,
      deviceInfo,
      success: false,
      timestamp: new Date(),
      provider: 'email',
    };

    if (!user) {
      attempt.failureReason = 'User not found';
      this.loginAttempts.push(attempt);
      return { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } };
    }

    attempt.userId = user.id;

    if (user.status !== 'active') {
      attempt.failureReason = `Account ${user.status}`;
      this.loginAttempts.push(attempt);
      return { success: false, error: { code: 'ACCOUNT_NOT_ACTIVE', message: `Account is ${user.status}` } };
    }

    if (!user.passwordHash || !this.verifyPassword(password, user.passwordHash)) {
      attempt.failureReason = 'Invalid password';
      this.loginAttempts.push(attempt);
      this.checkAccountLock(user.id);
      return { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } };
    }

    // Check MFA requirement
    if (user.mfa.isEnabled) {
      const mfaToken = this.generateToken(64);
      this.tokens.set(mfaToken, {
        token: mfaToken,
        type: 'access',
        userId: user.id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        issuedAt: new Date(),
        isRevoked: false,
      });

      return {
        success: true,
        mfaRequired: true,
        mfaToken,
      };
    }

    // Create session
    const session = await this.createSession(user.id, deviceInfo, ipAddress);
    const accessToken = this.generateToken(64);
    const refreshToken = this.generateToken(64);

    this.tokens.set(accessToken, {
      token: accessToken,
      type: 'access',
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      issuedAt: new Date(),
      deviceId: session.id,
      isRevoked: false,
    });

    this.tokens.set(refreshToken, {
      token: refreshToken,
      type: 'refresh',
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      issuedAt: new Date(),
      deviceId: session.id,
      isRevoked: false,
    });

    user.lastLoginAt = new Date();
    attempt.success = true;
    this.loginAttempts.push(attempt);

    this.logSecurityEvent(user.id, 'login_success', 'Successful login', ipAddress, deviceInfo);
    this.currentUser = user;
    this.currentSession = session;
    this.emit('login_success', { userId: user.id });

    return {
      success: true,
      user,
      accessToken,
      refreshToken,
      sessionId: session.id,
      expiresIn: 3600,
    };
  }

  /**
   * Login with phone/OTP
   */
  public async loginWithPhone(phone: string, otp: string, deviceInfo: DeviceInfo, ipAddress: string): Promise<AuthResult> {
    // In production, verify OTP against stored value
    const user = Array.from(this.users.values()).find((u) => u.phone === phone);

    if (!user) {
      return { success: false, error: { code: 'USER_NOT_FOUND', message: 'Phone number not registered' } };
    }

    if (user.status !== 'active') {
      return { success: false, error: { code: 'ACCOUNT_NOT_ACTIVE', message: `Account is ${user.status}` } };
    }

    // Verify OTP (simplified)
    if (otp !== '123456') {
      return { success: false, error: { code: 'INVALID_OTP', message: 'Invalid OTP' } };
    }

    const session = await this.createSession(user.id, deviceInfo, ipAddress);
    const accessToken = this.generateToken(64);
    const refreshToken = this.generateToken(64);

    this.tokens.set(accessToken, {
      token: accessToken,
      type: 'access',
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      issuedAt: new Date(),
      isRevoked: false,
    });

    this.tokens.set(refreshToken, {
      token: refreshToken,
      type: 'refresh',
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      issuedAt: new Date(),
      isRevoked: false,
    });

    user.lastLoginAt = new Date();
    user.phoneVerified = true;
    this.currentUser = user;
    this.currentSession = session;

    this.logSecurityEvent(user.id, 'login_success', 'Successful phone login', ipAddress, deviceInfo);
    this.emit('login_success', { userId: user.id });

    return {
      success: true,
      user,
      accessToken,
      refreshToken,
      sessionId: session.id,
      expiresIn: 3600,
    };
  }

  /**
   * Verify MFA
   */
  public async verifyMFA(mfaToken: string, code: string, method: MFAMethod, deviceInfo: DeviceInfo, ipAddress: string): Promise<AuthResult> {
    const tokenData = this.tokens.get(mfaToken);
    if (!tokenData || tokenData.isRevoked || tokenData.expiresAt < new Date()) {
      return { success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired MFA token' } };
    }

    const user = this.users.get(tokenData.userId);
    if (!user) {
      return { success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } };
    }

    // Verify code (simplified - in production, verify against actual OTP/TOTP)
    if (code !== '123456') {
      return { success: false, error: { code: 'INVALID_CODE', message: 'Invalid verification code' } };
    }

    // Revoke MFA token
    tokenData.isRevoked = true;

    // Create session
    const session = await this.createSession(user.id, deviceInfo, ipAddress);
    session.mfaVerified = true;

    const accessToken = this.generateToken(64);
    const refreshToken = this.generateToken(64);

    this.tokens.set(accessToken, {
      token: accessToken,
      type: 'access',
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      issuedAt: new Date(),
      deviceId: session.id,
      isRevoked: false,
    });

    this.tokens.set(refreshToken, {
      token: refreshToken,
      type: 'refresh',
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      issuedAt: new Date(),
      deviceId: session.id,
      isRevoked: false,
    });

    user.lastLoginAt = new Date();
    user.mfa.lastVerified = new Date();
    this.currentUser = user;
    this.currentSession = session;

    this.logSecurityEvent(user.id, 'mfa_verified', 'MFA verification successful', ipAddress, deviceInfo);
    this.emit('login_success', { userId: user.id });

    return {
      success: true,
      user,
      accessToken,
      refreshToken,
      sessionId: session.id,
      expiresIn: 3600,
    };
  }

  /**
   * Logout
   */
  public async logout(sessionId: string, ipAddress?: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = 'revoked';

    // Revoke all tokens for this session
    this.tokens.forEach((token) => {
      if (token.deviceId === sessionId) {
        token.isRevoked = true;
      }
    });

    this.logSecurityEvent(session.userId, 'logout', 'User logged out', ipAddress || session.ipAddress);
    this.emit('logout', { sessionId, userId: session.userId });

    if (this.currentSession?.id === sessionId) {
      this.currentUser = null;
      this.currentSession = null;
    }

    return true;
  }

  /**
   * Logout all sessions
   */
  public async logoutAllSessions(userId: string, exceptSessionId?: string): Promise<number> {
    let count = 0;
    this.sessions.forEach((session) => {
      if (session.userId === userId && session.id !== exceptSessionId && session.status === 'active') {
        session.status = 'revoked';
        count++;
      }
    });

    this.tokens.forEach((token) => {
      if (token.userId === userId) {
        token.isRevoked = true;
      }
    });

    this.logSecurityEvent(userId, 'session_revoked', `Revoked ${count} sessions`);
    return count;
  }

  /**
   * Create session
   */
  private async createSession(userId: string, deviceInfo: DeviceInfo, ipAddress: string): Promise<AuthSession> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    // Check max sessions
    const activeSessions = Array.from(this.sessions.values()).filter(
      (s) => s.userId === userId && s.status === 'active'
    );

    if (activeSessions.length >= user.security.maxSessions) {
      // Revoke oldest session
      const oldestSession = activeSessions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
      oldestSession.status = 'revoked';
    }

    const session: AuthSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
      userId,
      deviceInfo,
      ipAddress,
      status: 'active',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + user.security.sessionTimeout * 60 * 1000),
      lastActivityAt: new Date(),
      mfaVerified: false,
      riskScore: this.calculateRiskScore(userId, deviceInfo, ipAddress),
    };

    this.sessions.set(session.id, session);

    // Check for new device
    const isNewDevice = !user.security.trustedDevices.some(
      (d) => d.fingerprint === deviceInfo.fingerprint
    );

    if (isNewDevice) {
      this.logSecurityEvent(userId, 'new_device', 'Login from new device', ipAddress, deviceInfo, { severity: 'medium' });
    }

    return session;
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(userId: string, deviceInfo: DeviceInfo, ipAddress: string): number {
    let score = 0;
    const user = this.users.get(userId);
    if (!user) return 100;

    // New device
    const isNewDevice = !user.security.trustedDevices.some((d) => d.fingerprint === deviceInfo.fingerprint);
    if (isNewDevice) score += 20;

    // Check recent failed attempts
    const recentAttempts = this.loginAttempts.filter(
      (a) => a.userId === userId && !a.success && a.timestamp > new Date(Date.now() - 60 * 60 * 1000)
    );
    score += Math.min(recentAttempts.length * 10, 30);

    return Math.min(score, 100);
  }

  /**
   * Refresh token
   */
  public async refreshAccessToken(refreshToken: string): Promise<AuthResult> {
    const tokenData = this.tokens.get(refreshToken);
    if (!tokenData || tokenData.type !== 'refresh' || tokenData.isRevoked || tokenData.expiresAt < new Date()) {
      return { success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired refresh token' } };
    }

    const user = this.users.get(tokenData.userId);
    if (!user || user.status !== 'active') {
      return { success: false, error: { code: 'USER_NOT_ACTIVE', message: 'User account not active' } };
    }

    const newAccessToken = this.generateToken(64);
    this.tokens.set(newAccessToken, {
      token: newAccessToken,
      type: 'access',
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      issuedAt: new Date(),
      deviceId: tokenData.deviceId,
      isRevoked: false,
    });

    return {
      success: true,
      accessToken: newAccessToken,
      expiresIn: 3600,
    };
  }

  /**
   * Validate token
   */
  public validateToken(token: string): { valid: boolean; user?: UserAccount; error?: string } {
    const tokenData = this.tokens.get(token);
    if (!tokenData) {
      return { valid: false, error: 'Token not found' };
    }

    if (tokenData.isRevoked) {
      return { valid: false, error: 'Token revoked' };
    }

    if (tokenData.expiresAt < new Date()) {
      return { valid: false, error: 'Token expired' };
    }

    const user = this.users.get(tokenData.userId);
    if (!user || user.status !== 'active') {
      return { valid: false, error: 'User not found or not active' };
    }

    return { valid: true, user };
  }

  /**
   * Send email verification
   */
  public async sendEmailVerification(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user?.email) return false;

    const token = this.generateToken(32);
    this.tokens.set(token, {
      token,
      type: 'email_verification',
      userId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      issuedAt: new Date(),
      isRevoked: false,
    });

    // In production, send actual email
    console.log(`Email verification link: /verify-email?token=${token}`);
    return true;
  }

  /**
   * Verify email
   */
  public async verifyEmail(token: string): Promise<boolean> {
    const tokenData = this.tokens.get(token);
    if (!tokenData || tokenData.type !== 'email_verification' || tokenData.isRevoked || tokenData.expiresAt < new Date()) {
      return false;
    }

    const user = this.users.get(tokenData.userId);
    if (!user) return false;

    user.emailVerified = true;
    if (user.status === 'pending') {
      user.status = 'active';
    }
    tokenData.isRevoked = true;

    this.emit('email_verified', { userId: user.id });
    return true;
  }

  /**
   * Send phone verification
   */
  public async sendPhoneVerification(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user?.phone) return false;

    // In production, send actual SMS with OTP
    console.log(`Phone verification OTP: 123456`);
    return true;
  }

  /**
   * Reset password request
   */
  public async requestPasswordReset(email: string): Promise<boolean> {
    const user = Array.from(this.users.values()).find((u) => u.email === email);
    if (!user) return true; // Return true to prevent email enumeration

    const token = this.generateToken(32);
    this.tokens.set(token, {
      token,
      type: 'reset_password',
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      issuedAt: new Date(),
      isRevoked: false,
    });

    // In production, send actual email
    console.log(`Password reset link: /reset-password?token=${token}`);
    this.logSecurityEvent(user.id, 'password_reset', 'Password reset requested');
    return true;
  }

  /**
   * Reset password
   */
  public async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    const tokenData = this.tokens.get(token);
    if (!tokenData || tokenData.type !== 'reset_password' || tokenData.isRevoked || tokenData.expiresAt < new Date()) {
      return { success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired reset token' } };
    }

    const user = this.users.get(tokenData.userId);
    if (!user) {
      return { success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } };
    }

    const validation = this.validatePassword(newPassword, user.security.passwordPolicy);
    if (!validation.valid) {
      return { success: false, error: { code: 'WEAK_PASSWORD', message: validation.errors.join(', ') } };
    }

    user.passwordHash = this.hashPassword(newPassword);
    user.lastPasswordChange = new Date();
    tokenData.isRevoked = true;

    // Revoke all sessions
    await this.logoutAllSessions(user.id);

    this.logSecurityEvent(user.id, 'password_changed', 'Password reset completed');
    this.emit('password_reset', { userId: user.id });

    return { success: true };
  }

  /**
   * Change password
   */
  public async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResult> {
    const user = this.users.get(userId);
    if (!user) {
      return { success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } };
    }

    if (!user.passwordHash || !this.verifyPassword(currentPassword, user.passwordHash)) {
      return { success: false, error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' } };
    }

    const validation = this.validatePassword(newPassword, user.security.passwordPolicy);
    if (!validation.valid) {
      return { success: false, error: { code: 'WEAK_PASSWORD', message: validation.errors.join(', ') } };
    }

    user.passwordHash = this.hashPassword(newPassword);
    user.lastPasswordChange = new Date();

    this.logSecurityEvent(userId, 'password_changed', 'Password changed successfully');
    this.emit('password_changed', { userId });

    return { success: true };
  }

  /**
   * Enable MFA
   */
  public async enableMFA(userId: string, method: MFAMethod): Promise<{ success: boolean; secret?: string; backupCodes?: string[] }> {
    const user = this.users.get(userId);
    if (!user) return { success: false };

    user.mfa.isEnabled = true;
    if (!user.mfa.methods.includes(method)) {
      user.mfa.methods.push(method);
    }
    user.mfa.primaryMethod = method;

    if (method === 'authenticator') {
      user.mfa.totpSecret = this.generateToken(16);
    }

    // Generate backup codes
    user.mfa.backupCodes = Array.from({ length: 10 }, () => this.generateToken(8));

    this.logSecurityEvent(userId, 'mfa_enabled', `MFA enabled with ${method}`);
    this.emit('mfa_enabled', { userId, method });

    return {
      success: true,
      secret: user.mfa.totpSecret,
      backupCodes: user.mfa.backupCodes,
    };
  }

  /**
   * Disable MFA
   */
  public async disableMFA(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;

    user.mfa.isEnabled = false;
    user.mfa.methods = [];
    user.mfa.primaryMethod = undefined;
    user.mfa.totpSecret = undefined;
    user.mfa.backupCodes = undefined;

    this.logSecurityEvent(userId, 'mfa_disabled', 'MFA disabled');
    this.emit('mfa_disabled', { userId });

    return true;
  }

  /**
   * Check account lock
   */
  private checkAccountLock(userId: string): void {
    const recentAttempts = this.loginAttempts.filter(
      (a) => a.userId === userId && !a.success && a.timestamp > new Date(Date.now() - 15 * 60 * 1000)
    );

    if (recentAttempts.length >= 5) {
      const user = this.users.get(userId);
      if (user) {
        user.status = 'locked';
        this.logSecurityEvent(userId, 'account_locked', 'Account locked due to multiple failed login attempts', '', undefined, { severity: 'high' });
        this.emit('account_locked', { userId });
      }
    }
  }

  /**
   * Unlock account
   */
  public async unlockAccount(userId: string, unlockedBy: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || user.status !== 'locked') return false;

    user.status = 'active';
    this.logSecurityEvent(userId, 'account_unlocked', `Account unlocked by ${unlockedBy}`);
    this.emit('account_unlocked', { userId, unlockedBy });

    return true;
  }

  /**
   * Get user
   */
  public getUser(userId: string): UserAccount | undefined {
    return this.users.get(userId);
  }

  /**
   * Get current user
   */
  public getCurrentUser(): UserAccount | null {
    return this.currentUser;
  }

  /**
   * Get sessions
   */
  public getSessions(userId: string): AuthSession[] {
    return Array.from(this.sessions.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());
  }

  /**
   * Get security events
   */
  public getSecurityEvents(userId: string, limit: number = 50): SecurityEvent[] {
    return this.securityEvents
      .filter((e) => e.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Log security event
   */
  private logSecurityEvent(
    userId: string,
    type: SecurityEventType,
    description: string,
    ipAddress: string = '',
    deviceInfo?: DeviceInfo,
    options?: { severity?: SecurityEvent['severity']; metadata?: Record<string, unknown> }
  ): void {
    const event: SecurityEvent = {
      id: `event-${Date.now()}`,
      userId,
      type,
      description,
      ipAddress,
      deviceInfo,
      metadata: options?.metadata,
      severity: options?.severity || 'low',
      timestamp: new Date(),
    };

    this.securityEvents.push(event);
    if (this.securityEvents.length > 10000) {
      this.securityEvents = this.securityEvents.slice(-5000);
    }

    this.emit('security_event', event);
  }

  /**
   * Check permission
   */
  public hasPermission(userId: string, permission: Permission): boolean {
    const user = this.users.get(userId);
    return user?.permissions.includes(permission) ?? false;
  }

  /**
   * Update user role
   */
  public updateUserRole(userId: string, newRole: UserRole, updatedBy: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    user.role = newRole;
    user.permissions = ROLE_PERMISSIONS[newRole];
    user.updatedAt = new Date();

    this.logSecurityEvent(userId, 'permissions_changed', `Role changed to ${newRole} by ${updatedBy}`, '', undefined, { severity: 'medium' });
    this.emit('role_updated', { userId, newRole, updatedBy });

    return true;
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

export const authenticationService = AuthenticationService.getInstance();
export type {
  AuthProvider,
  UserRole,
  Permission,
  TokenType,
  MFAMethod,
  SessionStatus,
  AccountStatus,
  UserAccount,
  AuthProviderLink,
  MFASettings,
  SecuritySettings,
  TrustedDevice,
  PasswordPolicy,
  UserProfile,
  ProfileAddress,
  EmergencyContact,
  UserMetadata,
  AuthSession,
  DeviceInfo,
  SessionLocation,
  AuthToken,
  LoginAttempt,
  SecurityEvent,
  SecurityEventType,
  AuthResult,
  AuthError,
  RegistrationData,
};
