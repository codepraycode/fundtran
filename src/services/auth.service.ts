import db from '../config/database';
import type { IUser, IUserCreate, IUserLogin } from '../interfaces/user.interface';
import { ApiError } from '../utils/apiError';
import { createLogger } from '../utils/logger';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const authLogger = createLogger('auth');

// Configuration
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

export const register = async (userData: IUserCreate): Promise<Omit<IUser, 'password'>> => {
  try {
    authLogger.debug('Attempting to register new user', { email: userData.email });

    // Check if user already exists
    const existingUser = await db<IUser>('users')
      .where('email', userData.email)
      .orWhere('phone', userData.phone)
      .first();

    if (existingUser) {
      throw new ApiError(409, 'User with this email or phone already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

    // Create user
    const [user] = await db<IUser>('users')
      .insert({
        ...userData,
        password: hashedPassword,
        verification_token: uuidv4(),
        is_verified: false // Set to true if you don't need email verification
      })
      .returning(['id', 'first_name', 'last_name', 'email', 'phone', 'created_at']);

    if (!user) {
        throw new Error("Could not register");
    }

    authLogger.info('User registered successfully', { userId: user.id });

    // In a real app, you would send a verification email here
    // await sendVerificationEmail(user.email, user.verification_token);

    return user;
  } catch (error) {
    authLogger.error('Registration failed', error as Error, { email: userData.email });
    throw error;
  }
};


function generateToken(dt: Record<any, any>, secret:string, expiresIn: number | `${number}d`) {
    return jwt.sign(
        dt,
        secret,
        { expiresIn }
    );
}

export const login = async (credentials: IUserLogin): Promise<{ 
  token: string; 
  refreshToken: string;
  user: Omit<IUser, 'password'>;
}> => {
  try {
    authLogger.debug('Login attempt', { email: credentials.email });

    // Find user by email
    const user = await db<IUser>('users')
      .where('email', credentials.email)
      .first();

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check if user is verified
    if (!user.is_verified) {
      throw new ApiError(403, 'Please verify your email address first');
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(credentials.password, user.password);
    if (!passwordMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken(
        { id: user.id, email: user.email },
        JWT_SECRET,
        `${Number(JWT_EXPIRES_IN)}d`
    )

    // Generate refresh token
    const refreshToken = generateToken(
        { id: user.id },
        JWT_SECRET + user.password, // Using password in secret to invalidate when password changes
        `${REFRESH_TOKEN_EXPIRY_DAYS}d`
    )
    // Store refresh token in database
    await db('refresh_tokens').insert({
      token: refreshToken,
      user_id: user.id,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    });

    // Update last login
    await db<IUser>('users')
      .where('id', user.id)
      .update({ last_login: new Date() });

    authLogger.info('Login successful', { userId: user.id });

    // Return user data without password
    const { password, ...userWithoutPassword } = user;

    return {
      token,
      refreshToken,
      user: userWithoutPassword
    };
  } catch (error) {
    authLogger.error('Login failed', error as Error, { email: credentials.email });
    throw error;
  }
};

export const refreshToken = async (token: string): Promise<{ token: string; refreshToken: string }> => {
  try {
    authLogger.debug('Attempting to refresh token');

    // Find the refresh token in database
    const storedToken = await db('refresh_tokens')
      .where('token', token)
      .first();

    if (!storedToken) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    // Check if token is expired
    if (new Date(storedToken.expires_at) < new Date()) {
      await db('refresh_tokens').where('token', token).del();
      throw new ApiError(401, 'Refresh token expired');
    }

    // Verify the token
    const user = await db<IUser>('users')
      .where('id', storedToken.user_id)
      .first();

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    jwt.verify(token, JWT_SECRET + user.password);

    // Generate new tokens
    const newToken = generateToken(
        { id: user.id, email: user.email },
        JWT_SECRET,
        Number(JWT_EXPIRES_IN)
    )

    const newRefreshToken =  generateToken(
        { id: user.id },
        JWT_SECRET + user.password,
        `${REFRESH_TOKEN_EXPIRY_DAYS}d`
    )

    // Update refresh token in database
    await db('refresh_tokens')
      .where('token', token)
      .update({
        token: newRefreshToken,
        expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
      });

    authLogger.info('Token refreshed successfully', { userId: user.id });

    return {
      token: newToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    authLogger.error('Token refresh failed', error as Error);
    throw error;
  }
};

export const verifyEmail = async (token: string): Promise<void> => {
  try {
    authLogger.debug('Attempting email verification');

    const user = await db<IUser>('users')
      .where('verification_token', token)
      .first();

    if (!user) {
      throw new ApiError(404, 'Invalid verification token');
    }

    if (user.is_verified) {
      throw new ApiError(400, 'Email already verified');
    }

    await db<IUser>('users')
      .where('id', user.id)
      .update({
        is_verified: true,
        verification_token: null
      });

    authLogger.info('Email verified successfully', { userId: user.id });
  } catch (error) {
    authLogger.error('Email verification failed', error as Error);
    throw error;
  }
};

export const logout = async (refreshToken: string): Promise<void> => {
  try {
    authLogger.debug('Attempting to logout');

    await db('refresh_tokens')
      .where('token', refreshToken)
      .del();

    authLogger.info('Logout successful');
  } catch (error) {
    authLogger.error('Logout failed', error as Error);
    throw error;
  }
};

export const changePassword = async (
  userId: number, 
  currentPassword: string, 
  newPassword: string
): Promise<void> => {
  try {
    authLogger.debug('Attempting to change password', { userId });

    const user = await db<IUser>('users')
      .where('id', userId)
      .first();

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password and invalidate all refresh tokens
    await db.transaction(async trx => {
      await trx<IUser>('users')
        .where('id', userId)
        .update({ password: hashedPassword });

      await trx('refresh_tokens')
        .where('user_id', userId)
        .del();
    });

    authLogger.info('Password changed successfully', { userId });
  } catch (error) {
    authLogger.error('Password change failed', error as Error, { userId });
    throw error;
  }
};