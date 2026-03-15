import crypto from 'crypto';

/**
 * Hash a password using PBKDF2
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha256')
    .toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [salt, storedHash] = hash.split(':');
  const computedHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha256')
    .toString('hex');
  return computedHash === storedHash;
}

/**
 * Generate a random token for email verification, password reset, etc
 */
export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a random verification code (shorter, human-readable)
 */
export function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
