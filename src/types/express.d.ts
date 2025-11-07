import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      decoded?: {
        id: string;
        email: string;
        isAdmin?: boolean;
        iat?: number;
        exp?: number;
      };
    }
  }
}
