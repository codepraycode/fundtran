// src/middlewares/auth.middleware.ts
import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError';
import db from '../config/database';
import type { AuthenticatedRequest } from '../types/request-types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret';

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, email: string };
    const user = await db('users').where('id', decoded.id).first();

    if (!user) {
      throw new ApiError(401, 'Invalid token - user not found');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    };

    next();
  } catch (error) {
    next(new ApiError(401, 'Not authenticated'));
  }
};