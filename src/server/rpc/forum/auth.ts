import { z } from 'zod';
import { os } from '@orpc/server';
import { userStorage, sessionStorage } from './storage.ts';
import { hashPassword, verifyPassword, generateToken } from '../../lib/crypto.ts';

// Validation schemas
const RegisterSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const VerifyEmailSchema = z.object({
  token: z.string(),
});

// Register handler
export const register = os
  .input(RegisterSchema)
  .handler(async ({ input }) => {
    const { username, email, password } = input;

    // Check if username already exists
    const existingUsername = await userStorage.getByUsername(username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Check if email already exists
    const existingEmail = await userStorage.getByEmail(email);
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    // Create user
    const verificationToken = generateToken();
    const user = await userStorage.create({
      username,
      email,
      passwordHash: hashPassword(password),
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      role: 'user',
      postCount: 0,
      lastActive: Date.now(),
      createdAt: Date.now(),
    });

    // TODO: Send verification email with token

    return {
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.id,
    };
  });

// Login handler
export const login = os
  .input(LoginSchema)
  .handler(async ({ input }) => {
    const { email, password } = input;

    const user = await userStorage.getByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!verifyPassword(password, user.passwordHash)) {
      throw new Error('Invalid email or password');
    }

    if (!user.emailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    // Create session
    const session = await sessionStorage.create(user.id);

    return {
      success: true,
      sessionToken: session.token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    };
  });

// Verify email handler
export const verifyEmail = os
  .input(VerifyEmailSchema)
  .handler(async ({ input }) => {
    const { token } = input;

    // Find user with this verification token
    const users = await userStorage.list();
    const user = users.find(
      u => u.emailVerificationToken === token && 
          u.emailVerificationTokenExpires && 
          u.emailVerificationTokenExpires > Date.now()
    );

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    // Verify email
    await userStorage.update(user.id, {
      emailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationTokenExpires: undefined,
    });

    return {
      success: true,
      message: 'Email verified successfully! You can now log in.',
    };
  });

// Get current user handler (requires session)
export const getCurrentUser = os
  .input(z.object({ sessionToken: z.string() }))
  .handler(async ({ input }) => {
    const session = await sessionStorage.getByToken(input.sessionToken);
    if (!session) {
      return null;
    }

    const user = await userStorage.get(session.userId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      postCount: user.postCount,
      createdAt: user.createdAt,
    };
  });

// Logout handler
export const logout = os
  .input(z.object({ sessionToken: z.string() }))
  .handler(async ({ input }) => {
    await sessionStorage.revoke(input.sessionToken);
    return { success: true };
  });

// Update profile handler
export const updateProfile = os
  .input(z.object({
    sessionToken: z.string(),
    avatar: z.string().optional(),
    bio: z.string().max(500).optional(),
  }))
  .handler(async ({ input }) => {
    const session = await sessionStorage.getByToken(input.sessionToken);
    if (!session) {
      throw new Error('Invalid session');
    }

    const user = await userStorage.update(session.userId, {
      avatar: input.avatar,
      bio: input.bio,
    });

    return {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
    };
  });
