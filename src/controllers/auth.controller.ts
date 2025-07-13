
import type { Request, Response, NextFunction } from 'express';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  logoutSchema
} from '../validations/auth.validation';
import * as authService from '../services/auth.service';
import { ApiError } from '../utils/apiError';
import type { AuthenticatedRequest } from '../types/request-types';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false, // Return all errors not just the first one
      stripUnknown: true // Remove unknown properties
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      throw new ApiError(400, 'Validation failed', errors);
    }

    const user = await authService.register(value);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      throw new ApiError(400, 'Validation failed', errors);
    }

    const token = await authService.login(value);
    res.status(200).json({ success: true, data: { token } });
  } catch (err) {
    next(err);
  }
};


export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = refreshTokenSchema.validate(req.body);
    if (error) {
      throw new ApiError(400, 'Validation failed', error.details);
    }

    const { token, refreshToken } = await authService.refreshToken(value.refreshToken);
    
    res.status(200).json({ 
      success: true, 
      data: { token, refreshToken } 
    });
  } catch (error) {
    next(error);
  }
};


export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = verifyEmailSchema.validate(req.body);
    if (error) {
      throw new ApiError(400, 'Validation failed', error.details);
    }

    await authService.verifyEmail(value.token);
    
    res.status(200).json({ 
      success: true, 
      message: 'Email verified successfully' 
    });
  } catch (error) {
    next(error);
  }
};


export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = logoutSchema.validate(req.body);
    if (error) {
      throw new ApiError(400, 'Validation failed', error.details);
    }

    await authService.logout(value.refreshToken);
    
    res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    next(error);
  }
};


export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  // Implementation...
};

export const resetPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      throw new ApiError(400, 'Validation failed', error.details);
    }

    // req.user is set by the authentication middleware
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    await authService.changePassword(
      req.user.id,
      value.currentPassword,
      value.newPassword
    );
    
    res.status(200).json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    next(error);
  }
};