import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

/** Sign a new JWT token */
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

/** Verify and decode a JWT token — returns null on failure */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/** Cookie config for auth_token */
const isProduction = process.env.NODE_ENV === 'production';

export const cookieOptions = {
  httpOnly: true,
  secure: isProduction,            // HTTPS-only in production
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',  // cross-origin on Vercel+Render
  maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in ms
  path: '/',
};
