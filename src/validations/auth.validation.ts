
import Joi from 'joi';
import type { IUserCreate, IUserLogin } from '../interfaces/user.interface';

export const registerSchema = Joi.object<IUserCreate>({
  first_name: Joi.string().required().min(2).max(50)
    .messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters'
    }),
  last_name: Joi.string().required().min(2).max(50)
    .messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),
  password: Joi.string().required().min(8).max(30)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password cannot exceed 30 characters',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    }),
  phone: Joi.string().required().pattern(new RegExp('^[0-9]{11}$'))
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Phone number must be 11 digits'
    })
});

export const loginSchema = Joi.object<IUserLogin>({
  email: Joi.string().email().required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),
  password: Joi.string().required()
    .messages({
      'string.empty': 'Password is required'
    })
});

// Optional: Forgot password and reset password schemas
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

export const resetPasswordSchema = Joi.object({
  currentPassword: Joi.string().required()
    .messages({
      'string.empty': 'Current password is required'
    }),
  newPassword: Joi.string().required().min(8).max(30)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 8 characters',
      'string.max': 'New password cannot exceed 30 characters',
      'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    })
});


export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
    .messages({
      'string.empty': 'Refresh token is required'
    })
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().required()
    .messages({
      'string.empty': 'Verification token is required'
    })
});

export const logoutSchema = Joi.object({
  refreshToken: Joi.string().required()
    .messages({
      'string.empty': 'Refresh token is required'
    })
});


