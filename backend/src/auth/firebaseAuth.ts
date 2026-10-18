import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

let firebaseInitialized = false;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    firebaseInitialized = true;
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (err) {
    console.warn('Firebase Admin SDK initialization skipped or failed:', err);
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    isDemoUser: boolean;
  };
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header. Expected Bearer token.' });
    return;
  }

  const token = authHeader.split('Bearer ')[1].trim();

  // Support demo / guest mode token without external network dependency
  if (token === 'demo-token' || token.startsWith('demo-user-') || token === 'guest-token') {
    req.user = {
      uid: token === 'guest-token' ? 'guest-user-01' : token.startsWith('demo-user-') ? token : 'demo-user-default',
      email: 'demo-user@medilens.ai',
      isDemoUser: true
    };
    return next();
  }

  // Real Firebase ID Token verification
  if (firebaseInitialized) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        isDemoUser: false
      };
      return next();
    } catch (err: any) {
      res.status(403).json({ error: `Invalid or expired Firebase ID token: ${err.message}` });
      return;
    }
  }

  // If Firebase Admin credentials are not yet set up in the environment,
  // allow client-generated simulation tokens for testing/development
  if (token.startsWith('user_') || token.length >= 8) {
    req.user = {
      uid: token,
      email: `${token}@medilens.local`,
      isDemoUser: false
    };
    return next();
  }

  res.status(403).json({ error: 'Unauthorized: Invalid token format.' });
}
