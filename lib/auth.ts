// JWT Authentication - Secure token-based access control
// Supports role-based access: patient, asha, doctor, admin

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'deepblue-hackathon-s11-2026';
const TOKEN_EXPIRY = '7d';

export interface UserPayload {
  userId: string;
  role: 'patient' | 'asha' | 'doctor' | 'admin';
  name?: string;
  timestamp: number;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for authenticated users
 */
export function generateToken(userId: string, role: UserPayload['role'] = 'patient', name?: string): string {
  const payload: UserPayload = {
    userId,
    role,
    name,
    timestamp: Date.now(),
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verify and decode a JWT token
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

/**
 * Extract token from request headers
 * Supports: Authorization: Bearer <token>
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Middleware-like function to authenticate a request
 * @returns User payload or null if unauthorized
 */
export function authenticateRequest(request: NextRequest): UserPayload | null {
  const token = extractToken(request);
  
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Check if user has required role
 */
export function hasRole(user: UserPayload | null, requiredRoles: UserPayload['role'][]): boolean {
  if (!user) return false;
  return requiredRoles.includes(user.role);
}

/**
 * Demo mode users for hackathon presentation
 */
export const DEMO_USERS = {
  patient: {
    userId: 'demo-patient-001',
    phoneNumber: '+91-9876543210',
    name: 'Sachin Patil',
    role: 'patient' as const,
    village: 'Baramati, Maharashtra',
  },
  asha: {
    userId: 'demo-asha-001',
    phoneNumber: '+91-9876543211',
    name: 'Aarti Deshmukh',
    role: 'asha' as const,
    village: 'Satara, Maharashtra',
  },
  doctor: {
    userId: 'demo-doctor-001',
    phoneNumber: '+91-9876543212',
    name: 'Dr. Anjali Joshi',
    role: 'doctor' as const,
    hospital: 'PHC Baramati',
  },
};
