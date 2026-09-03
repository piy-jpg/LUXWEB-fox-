/**
 * Authentication Controller
 * Handles customer registration, login, session check, and password resets.
 */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { generateToken } = require('../middleware/auth');
const { logAudit } = require('../middleware/auditLogger');
const { sendRealSms } = require('../services/smsService');
const { sendEmailOtp } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'lumiere_luxury_secret_jwt_key_2026';

/**
 * Customer Registration
 */
async function signup(req, res) {
  const { email, password, firstName, lastName, phone } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userRes = await db.run(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [normalizedEmail, passwordHash, firstName ? firstName.trim() : null, lastName ? lastName.trim() : null, phone ? phone.trim() : null]
    );

    const userId = userRes.lastInsertRowid;

    // Assign CUSTOMER role
    const customerRole = await db.get('SELECT id FROM roles WHERE name = ?', ['CUSTOMER']);
    if (customerRole) {
      await db.run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, customerRole.id]);
    }

    // Initialize customer wishlist
    await db.run('INSERT INTO wishlists (user_id) VALUES (?)', [userId]);

    const user = {
      id: userId,
      email: normalizedEmail,
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
    };

    const token = generateToken(user, ['CUSTOMER'], []);

    logAudit({
      userId,
      userEmail: normalizedEmail,
      userRole: 'CUSTOMER',
      action: 'customer.signup',
      entityType: 'user',
      entityId: userId,
      details: { email: normalizedEmail },
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to Lumière.',
      token,
      user: {
        id: userId,
        email: normalizedEmail,
        firstName: firstName || '',
        lastName: lastName || '',
        roles: ['CUSTOMER'],
        permissions: [],
      },
    });
  } catch (err) {
    console.error('[Auth.Signup] Error:', err);
    return res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
}

/**
 * User Login (Customers, Staff & Owners)
 */
async function login(req, res) {
  const { email, phone, identifier: rawId, password } = req.body;
  const identifier = (rawId || email || phone || '').trim();

  if (!identifier || !password) {
    return res.status(400).json({ success: false, error: 'Mobile number/email and password are required.' });
  }

  const normalizedEmail = identifier.toLowerCase();
  const digitsOnly = identifier.replace(/\D/g, '');

  try {
    let user = await db.get(
      'SELECT id, email, password_hash, first_name, last_name, phone, status FROM users WHERE email = ? OR phone = ?',
      [normalizedEmail, identifier]
    );

    // If not found directly, try matching phone by last 10 digits
    if (!user && digitsOnly.length >= 10) {
      const last10 = digitsOnly.slice(-10);
      user = await db.get(
        'SELECT id, email, password_hash, first_name, last_name, phone, status FROM users WHERE phone LIKE ?',
        [`%${last10}`]
      );
    }

    // 1. Guaranteed Authentication for Exclusive Owner (piyushverma730929@gmail.com with piyush@123)
    if (
      (normalizedEmail === 'piyushverma730929@gmail.com' || digitsOnly.endsWith('7300212948')) &&
      password === 'piyush@123'
    ) {
      const ownerUser = {
        id: user ? user.id : 7,
        email: 'piyushverma730929@gmail.com',
        firstName: 'Piyush',
        lastName: 'Verma',
        phone: '+91 7300212948',
        status: 'active',
      };
      const ownerRoles = ['OWNER', 'CUSTOMER'];
      const ownerPermissions = [
        'products.view', 'products.create', 'products.edit', 'products.delete',
        'inventory.view', 'inventory.adjust', 'orders.view', 'orders.update',
        'customers.view', 'analytics.view', 'staff.manage', 'settings.manage'
      ];
      const token = generateToken(ownerUser, ownerRoles, ownerPermissions);
      return res.json({
        success: true,
        message: 'Welcome back, Piyush. Owner access granted.',
        token,
        user: {
          id: ownerUser.id,
          email: ownerUser.email,
          firstName: ownerUser.firstName,
          lastName: ownerUser.lastName,
          phone: ownerUser.phone,
          roles: ownerRoles,
          permissions: ownerPermissions,
          isStaff: true,
          isOwner: true,
        },
      });
    }

    // 2. Guaranteed Customer Demo
    if (normalizedEmail === 'customer@lumiere.com' && password === 'Lumiere2026!') {
      const custUser = {
        id: user ? user.id : 5,
        email: 'customer@lumiere.com',
        firstName: 'Camille',
        lastName: 'Rousseau',
        phone: '+1 (555) 234-5678',
        status: 'active',
      };
      const custRoles = ['CUSTOMER'];
      const custPermissions = [];
      const token = generateToken(custUser, custRoles, custPermissions);
      return res.json({
        success: true,
        message: 'Welcome back, Camille.',
        token,
        user: {
          id: custUser.id,
          email: custUser.email,
          firstName: custUser.firstName,
          lastName: custUser.lastName,
          phone: custUser.phone,
          roles: custRoles,
          permissions: custPermissions,
          isStaff: false,
          isOwner: false,
        },
      });
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid login credentials. Please check your mobile/email or password.' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({
        success: false,
        error: 'This account has been disabled. Please contact Lumière administration.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // Fetch user roles
    const roleRows = await db.query(
      `SELECT r.name FROM roles r
       JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [user.id]
    );
    let roles = roleRows.map(r => r.name);

    // Exclusive Owner Authorization: Only piyushverma730929@gmail.com can access as OWNER
    if (user.email.toLowerCase() === 'piyushverma730929@gmail.com') {
      if (!roles.includes('OWNER')) {
        const ownerRole = await db.get('SELECT id FROM roles WHERE name = ?', ['OWNER']);
        if (ownerRole) {
          await db.run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [user.id, ownerRole.id]);
          roles.push('OWNER');
        }
      }
    } else {
      // Strictly remove OWNER role for all other users
      roles = roles.filter(r => r !== 'OWNER');
    }

    // Fetch user permissions
    const permRows = await db.query(
      `SELECT DISTINCT p.code FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       JOIN user_roles ur ON ur.role_id = rp.role_id
       WHERE ur.user_id = ?`,
      [user.id]
    );
    const permissions = permRows.map(p => p.code);

    // Update last login
    await db.run('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    const token = generateToken(user, roles, permissions);

    logAudit({
      req,
      userId: user.id,
      userEmail: user.email,
      userRole: roles[0] || 'CUSTOMER',
      action: 'auth.login',
      entityType: 'user',
      entityId: user.id,
      details: { email: user.email, roles },
    });

    return res.json({
      success: true,
      message: `Welcome back, ${user.first_name || 'Guest'}.`,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        phone: user.phone || '',
        roles,
        permissions,
        isStaff: roles.some(r => ['OWNER', 'MANAGER', 'INVENTORY_STAFF', 'ORDER_STAFF'].includes(r)),
        isOwner: roles.includes('OWNER'),
      },
    });
  } catch (err) {
    console.error('[Auth.Login] Error:', err);
    return res.status(500).json({ success: false, error: 'Authentication service error.' });
  }
}

/**
 * Get current session profile
 */
async function getMe(req, res) {
  return res.json({
    success: true,
    user: req.user,
  });
}

/**
 * Forgot password request (Generates reset token)
 */
async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email address is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await db.get('SELECT id, email FROM users WHERE email = ?', [normalizedEmail]);
    if (!user) {
      // Return success message even if not found to prevent user enumeration
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset token has been issued.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    await db.run(
      'UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?',
      [resetToken, expiresAt, user.id]
    );

    logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'auth.forgot_password',
      entityType: 'user',
      entityId: user.id,
      details: { email: user.email },
    });

    return res.json({
      success: true,
      message: 'Password reset code generated. Use the token to create a new password.',
      resetToken, // Returned in dev/testing mode for ease of verification
    });
  } catch (err) {
    console.error('[Auth.ForgotPassword] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to process password reset.' });
  }
}

/**
 * Reset password with token
 */
async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ success: false, error: 'Token and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
  }

  try {
    const user = await db.get(
      'SELECT id, email, reset_token_expires_at FROM users WHERE reset_token = ?',
      [token]
    );

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired password reset token.' });
    }

    if (new Date() > new Date(user.reset_token_expires_at)) {
      return res.status(400).json({ success: false, error: 'Password reset token has expired. Please request a new one.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await db.run(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newHash, user.id]
    );

    logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'auth.reset_password',
      entityType: 'user',
      entityId: user.id,
      details: { email: user.email },
    });

    return res.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.',
    });
  } catch (err) {
    console.error('[Auth.ResetPassword] Error:', err);
    return res.status(500).json({ success: false, error: 'Password reset failed.' });
  }
}

/**
 * Google OAuth Authentication (Sign-in or Sign-up)
 */
async function googleAuth(req, res) {
  const { credential, email: manualEmail, firstName: manualFirst, lastName: manualLast } = req.body;

  let email = null;
  let firstName = null;
  let lastName = null;

  try {
    if (credential) {
      // 1. Verify credential via Google tokeninfo
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          email = payload.email;
          firstName = payload.given_name || payload.name;
          lastName = payload.family_name || '';
        }
      } catch (networkErr) {
        console.warn('[Auth.googleAuth] Tokeninfo fetch notice:', networkErr.message);
      }

      // Fallback: decode JWT payload if offline or in sandbox
      if (!email) {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payloadStr = Buffer.from(parts[1], 'base64').toString('utf8');
          const payload = JSON.parse(payloadStr);
          email = payload.email;
          firstName = payload.given_name || payload.name || 'Google';
          lastName = payload.family_name || 'Client';
        }
      }
    } else if (manualEmail) {
      email = manualEmail;
      firstName = manualFirst || 'Google';
      lastName = manualLast || 'Client';
    }

    if (!email) {
      return res.status(400).json({ success: false, error: 'Google credential verification failed. No email provided.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await db.get(
      'SELECT id, email, password_hash, first_name, last_name, phone, status FROM users WHERE email = ?',
      [normalizedEmail]
    );

    let isNewUser = false;

    if (!user) {
      // Auto-create customer account
      isNewUser = true;
      const randomPassword = crypto.randomBytes(24).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      const userRes = await db.run(
        `INSERT INTO users (email, password_hash, first_name, last_name, status)
         VALUES (?, ?, ?, ?, 'active')`,
        [normalizedEmail, passwordHash, firstName || 'Valued', lastName || 'Client']
      );

      const userId = userRes.lastInsertRowid;

      // Assign CUSTOMER role
      const customerRole = await db.get('SELECT id FROM roles WHERE name = ?', ['CUSTOMER']);
      if (customerRole) {
        await db.run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, customerRole.id]);
      }

      // Initialize customer wishlist
      await db.run('INSERT INTO wishlists (user_id) VALUES (?)', [userId]);

      user = {
        id: userId,
        email: normalizedEmail,
        first_name: firstName || 'Valued',
        last_name: lastName || 'Client',
        status: 'active',
      };
    } else if (user.status === 'disabled') {
      return res.status(403).json({
        success: false,
        error: 'This account has been disabled. Please contact Lumière concierge support.',
      });
    }

    // Fetch user roles
    const roleRows = await db.query(
      `SELECT r.name FROM roles r
       JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [user.id]
    );
    let roles = roleRows.map(r => r.name);

    // Exclusive Owner Authorization: Only piyushverma730929@gmail.com can access as OWNER
    if (user.email.toLowerCase() === 'piyushverma730929@gmail.com') {
      if (!roles.includes('OWNER')) {
        const ownerRole = await db.get('SELECT id FROM roles WHERE name = ?', ['OWNER']);
        if (ownerRole) {
          await db.run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [user.id, ownerRole.id]);
          roles.push('OWNER');
        }
      }
    } else {
      // Strictly remove OWNER role for all other users
      roles = roles.filter(r => r !== 'OWNER');
    }

    // Fetch user permissions
    const permRows = await db.query(
      `SELECT DISTINCT p.code FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       JOIN user_roles ur ON ur.role_id = rp.role_id
       WHERE ur.user_id = ?`,
      [user.id]
    );
    let permissions = permRows.map(p => p.code);

    if (user.email.toLowerCase() === 'piyushverma730929@gmail.com') {
      if (!roles.includes('OWNER')) roles.push('OWNER');
      permissions = [
        'products.view', 'products.create', 'products.edit', 'products.delete',
        'inventory.view', 'inventory.adjust', 'orders.view', 'orders.update',
        'customers.view', 'analytics.view', 'staff.manage', 'settings.manage'
      ];
    }

    // Update last login
    await db.run('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    const token = generateToken(user, roles, permissions);

    logAudit({
      req,
      userId: user.id,
      userEmail: user.email,
      userRole: roles[0] || 'CUSTOMER',
      action: isNewUser ? 'customer.google_signup' : 'auth.google_login',
      entityType: 'user',
      entityId: user.id,
      details: { email: user.email, isNewUser },
    });

    return res.json({
      success: true,
      message: isNewUser ? 'Welcome to Lumière. Your personal atelier account is active.' : `Welcome back, ${user.first_name || 'Client'}.`,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        phone: user.phone || '',
        roles,
        permissions,
        isStaff: roles.some(r => ['OWNER', 'MANAGER', 'INVENTORY_STAFF', 'ORDER_STAFF'].includes(r)),
        isOwner: roles.includes('OWNER'),
      },
    });
  } catch (err) {
    console.error('[Auth.GoogleAuth] Error:', err);
    return res.status(500).json({ success: false, error: 'Google authentication service error.' });
  }
}

// In-memory OTP storage with TTL
const otpStore = new Map();

/**
 * Send OTP to phone number or email address
 */
async function sendOtp(req, res) {
  try {
    const { phone, email, identifier } = req.body;
    const targetEmail = (email || (identifier && identifier.includes('@') ? identifier : '')).trim().toLowerCase();
    const targetPhone = (phone || (identifier && !identifier.includes('@') ? identifier : '')).trim();

    if (!targetEmail && !targetPhone) {
      return res.status(400).json({ success: false, error: 'Mobile phone number or Email address is required.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // 1. FREE EMAIL OTP FLOW (Delivered to real email inbox via Gmail SMTP)
    if (targetEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(targetEmail)) {
        return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
      }

      otpStore.set(targetEmail, { otp, expiresAt, verified: false, email: targetEmail });
      const otpToken = jwt.sign({ email: targetEmail, otp }, JWT_SECRET, { expiresIn: '5m' });

      // Dispatch authentic email via Gmail SMTP
      const emailResult = await sendEmailOtp(targetEmail, otp);

      return res.json({
        success: true,
        channel: 'email',
        message: `✦ 6-digit verification code sent to ${targetEmail}. Please check your email inbox.`,
        email: targetEmail,
        realEmailSent: emailResult.success,
        reflectedOtp: null,
        otpToken,
        expiresInSeconds: 300,
      });
    }

    // 2. PHONE OTP FLOW
    const rawDigits = targetPhone.replace(/\D/g, '');
    if (rawDigits.length < 10) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.' });
    }

    const last10 = rawDigits.slice(-10);
    const normalizedPhone = targetPhone.startsWith('+') ? targetPhone : `+91 ${last10}`;

    // Store in memory
    otpStore.set(last10, { otp, expiresAt, verified: false, fullPhone: normalizedPhone });

    // Store in database if table exists
    try {
      await db.run(
        `INSERT INTO phone_otps (phone, otp, expires_at, verified)
         VALUES (?, ?, ?, 0)
         ON CONFLICT(phone) DO UPDATE SET otp = excluded.otp, expires_at = excluded.expires_at, verified = 0`,
        [last10, otp, new Date(expiresAt).toISOString()]
      );
    } catch (dbErr) {
      console.warn('[OTP] DB store notice:', dbErr.message);
    }

    try {
      logAudit({
        req,
        action: 'auth.otp_sent',
        entityType: 'phone',
        details: { phone: normalizedPhone },
      });
    } catch {}

    const otpToken = jwt.sign({ phone: last10, otp }, JWT_SECRET, { expiresIn: '5m' });
    const smsDispatch = await sendRealSms({ phone: normalizedPhone, otp });

    return res.json({
      success: true,
      channel: 'phone',
      message: smsDispatch.success 
        ? `✦ Real SMS dispatched to your mobile phone ${normalizedPhone}. Check your Messages app or apply code below.`
        : `✦ Atelier Code generated for ${normalizedPhone}. Enter code below to continue.`,
      phone: normalizedPhone,
      realSmsSent: smsDispatch.success,
      reflectedOtp: otp,
      provider: smsDispatch.provider,
      otpToken,
      expiresInSeconds: 300,
    });
  } catch (err) {
    console.error('[sendOtp] Error:', err);
    return res.status(500).json({ success: false, error: 'OTP service error. Please try again.' });
  }
}

/**
 * Verify OTP (Phone or Email)
 */
async function verifyOtp(req, res) {
  try {
    const { phone, email, otp, otpToken, verifiedByGoogle } = req.body;
    const targetEmail = (email || '').trim().toLowerCase();
    const targetPhone = (phone || '').trim();

    if (!targetEmail && !targetPhone) {
      return res.status(400).json({ success: false, error: 'Phone number or Email address is required.' });
    }

    const isEmail = Boolean(targetEmail);
    const key = isEmail ? targetEmail : targetPhone.replace(/\D/g, '').slice(-10);
    const enteredOtp = otp ? otp.toString().trim() : '';

    let isValid = Boolean(verifiedByGoogle);

    if (!isValid && enteredOtp) {
      // 1. Check stateless OTP token
      if (otpToken) {
        try {
          const decoded = jwt.verify(otpToken, JWT_SECRET);
          if ((decoded.email === key || decoded.phone === key) && decoded.otp === enteredOtp) {
            isValid = true;
          }
        } catch {}
      }

      // 2. Check in-memory store
      if (!isValid) {
        const memoryRecord = otpStore.get(key);
        if (memoryRecord && memoryRecord.otp === enteredOtp && Date.now() <= memoryRecord.expiresAt) {
          isValid = true;
          memoryRecord.verified = true;
        }
      }

      // 3. Check DB for phone otps
      if (!isValid && !isEmail) {
        try {
          const dbRecord = await db.get('SELECT * FROM phone_otps WHERE phone = ? AND otp = ?', [key, enteredOtp]);
          if (dbRecord) {
            const expiresTime = new Date(dbRecord.expires_at).getTime();
            if (Date.now() <= expiresTime) {
              isValid = true;
              await db.run('UPDATE phone_otps SET verified = 1 WHERE phone = ?', [key]);
            }
          }
        } catch {}
      }
    }

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification code. Please try again.' });
    }

    // Generate stateless verification token for profile completion (valid for 15 mins)
    const verificationToken = jwt.sign(
      { [isEmail ? 'email' : 'phone']: key, verified: true, type: 'otp_verified' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Check if client profile already exists
    let user = null;
    try {
      if (isEmail) {
        user = await db.get('SELECT id, email, first_name, last_name, phone, age, location, status FROM users WHERE email = ?', [key]);
      } else {
        user = await db.get('SELECT id, email, first_name, last_name, phone, age, location, status FROM users WHERE phone LIKE ?', [`%${key}`]);
      }
    } catch {}

    const isOwner = (targetEmail === 'piyushverma730929@gmail.com') || (key === '7300212948');

    // If user exists and already has full name, age, and location
    if (user && user.first_name && user.age && user.location) {
      const roles = isOwner ? ['OWNER', 'CUSTOMER'] : ['CUSTOMER'];
      const permissions = isOwner ? [
        'products.view', 'products.create', 'products.edit', 'products.delete',
        'inventory.view', 'inventory.adjust', 'orders.view', 'orders.update',
        'customers.view', 'analytics.view', 'staff.manage', 'settings.manage'
      ] : [];

      const token = generateToken(user, roles, permissions);
      return res.json({
        success: true,
        message: `Welcome back, ${user.first_name}.`,
        token,
        needsProfile: false,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name || '',
          phone: user.phone || (isEmail ? '' : `+91 ${key}`),
          age: user.age,
          location: user.location,
          roles,
          permissions,
          isStaff: isOwner,
          isOwner,
        },
      });
    }

    // User needs to complete their profile (name, age, location)
    return res.json({
      success: true,
      message: 'Code verified successfully. Please complete your atelier profile.',
      phone: isEmail ? '' : `+91 ${key}`,
      email: isEmail ? key : '',
      channel: isEmail ? 'email' : 'phone',
      needsProfile: true,
      verificationToken,
      existingName: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    });
  } catch (err) {
    console.error('[verifyOtp] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to verify code. Please try again.' });
  }
}

/**
 * Complete Client Profile (Name, Age, Location)
 */
async function completeProfile(req, res) {
  try {
    const { phone, email, name, age, location, verificationToken } = req.body;
    if ((!phone && !email) || !name || !age || !location) {
      return res.status(400).json({ success: false, error: 'Contact, Full Name, Age, and Location are all required.' });
    }

    let verifiedIdentifier = '';
    let isEmail = Boolean(email);

    if (verificationToken) {
      try {
        const decoded = jwt.verify(verificationToken, JWT_SECRET);
        if (decoded.email) {
          verifiedIdentifier = decoded.email;
          isEmail = true;
        } else if (decoded.phone) {
          verifiedIdentifier = decoded.phone;
          isEmail = false;
        }
      } catch {}
    }

    const rawPhoneDigits = (phone || '').replace(/\D/g, '');
    const phoneLast10 = rawPhoneDigits.slice(-10);
    const targetEmail = isEmail ? (email || verifiedIdentifier).toLowerCase() : '';

    const isOwner = (targetEmail === 'piyushverma730929@gmail.com') || (phoneLast10 === '7300212948') || (verifiedIdentifier === 'piyushverma730929@gmail.com');

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 10 || parsedAge > 120) {
      return res.status(400).json({ success: false, error: 'Please enter a valid age between 10 and 120.' });
    }

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Client';
    const lastName = nameParts.slice(1).join(' ') || '';
    const cleanLocation = location.trim();
    const formattedPhone = phoneLast10 ? (phone.startsWith('+') ? phone.trim() : `+91 ${phoneLast10}`) : '';
    const userEmail = targetEmail || (isOwner ? 'piyushverma730929@gmail.com' : `${phoneLast10}@client.lumiere.com`);

    const roles = isOwner ? ['OWNER', 'CUSTOMER'] : ['CUSTOMER'];
    const permissions = isOwner ? [
      'products.view', 'products.create', 'products.edit', 'products.delete',
      'inventory.view', 'inventory.adjust', 'orders.view', 'orders.update',
      'customers.view', 'analytics.view', 'staff.manage', 'settings.manage'
    ] : [];

    let user = null;
    try {
      if (userEmail) {
        user = await db.get('SELECT * FROM users WHERE email = ?', [userEmail]);
      }
      if (!user && phoneLast10) {
        user = await db.get('SELECT * FROM users WHERE phone LIKE ?', [`%${phoneLast10}`]);
      }

      if (user) {
        await db.run(
          `UPDATE users SET first_name = ?, last_name = ?, age = ?, location = ?, phone = COALESCE(NULLIF(?, ''), phone) WHERE id = ?`,
          [firstName, lastName, parsedAge, cleanLocation, formattedPhone, user.id]
        );
        user.first_name = firstName;
        user.last_name = lastName;
        user.age = parsedAge;
        user.location = cleanLocation;
      } else {
        const dummyPass = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
        const resUser = await db.run(
          `INSERT INTO users (email, password_hash, first_name, last_name, phone, age, location, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
          [userEmail, dummyPass, firstName, lastName, formattedPhone, parsedAge, cleanLocation]
        );
        const userId = resUser.lastInsertRowid || Date.now();
        user = {
          id: userId,
          email: userEmail,
          first_name: firstName,
          last_name: lastName,
          phone: formattedPhone,
          age: parsedAge,
          location: cleanLocation,
        };

        const targetRoleName = isOwner ? 'OWNER' : 'CUSTOMER';
        const roleRow = await db.get('SELECT id FROM roles WHERE name = ?', [targetRoleName]);
        if (roleRow) {
          await db.run('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, roleRow.id]);
        }
        await db.run('INSERT INTO wishlists (user_id) VALUES (?)', [userId]);
      }
    } catch (err) {
      console.warn('[Profile Complete] DB notice:', err.message);
      user = {
        id: user ? user.id : Date.now(),
        email: userEmail,
        first_name: firstName,
        last_name: lastName,
        phone: formattedPhone,
        age: parsedAge,
        location: cleanLocation,
      };
    }

    if (isEmail) {
      otpStore.delete(targetEmail);
    } else {
      otpStore.delete(phoneLast10);
    }

    const token = generateToken(user, roles, permissions);

    return res.json({
      success: true,
      message: `Welcome to Lumière, ${firstName}. Your atelier access is active.`,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name || '',
        phone: user.phone || formattedPhone,
        age: parsedAge,
        location: cleanLocation,
        roles,
        permissions,
        isStaff: isOwner,
        isOwner,
      },
    });
  } catch (err) {
    console.error('[completeProfile] Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to complete profile. Please try again.' });
  }
}

module.exports = {
  signup,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  googleAuth,
  sendOtp,
  verifyOtp,
  completeProfile,
};
