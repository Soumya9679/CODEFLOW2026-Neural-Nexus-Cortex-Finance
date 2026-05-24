import * as SecureStore from 'expo-secure-store';
import { User } from '../services/types';

const JWT_KEY = 'user_jwt_token';
const USER_KEY = 'user_profile_data';

/**
 * Save JWT token securely
 */
export async function saveToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(JWT_KEY, token);
  } catch (error) {
    console.error('Error saving JWT token in secure storage:', error);
  }
}

/**
 * Retrieve JWT token securely
 */
export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(JWT_KEY);
  } catch (error) {
    console.error('Error getting JWT token from secure storage:', error);
    return null;
  }
}

/**
 * Delete JWT token securely
 */
export async function deleteToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(JWT_KEY);
  } catch (error) {
    console.error('Error deleting JWT token from secure storage:', error);
  }
}

/**
 * Save user profile data
 */
export async function saveUser(user: User): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user profile in secure storage:', error);
  }
}

/**
 * Retrieve user profile data
 */
export async function getUser(): Promise<User | null> {
  try {
    const userStr = await SecureStore.getItemAsync(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting user profile from secure storage:', error);
    return null;
  }
}

/**
 * Delete user profile data
 */
export async function deleteUser(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch (error) {
    console.error('Error deleting user profile from secure storage:', error);
  }
}

/**
 * Clear all auth data from secure storage
 */
export async function clearAuthSession(): Promise<void> {
  try {
    await Promise.all([deleteToken(), deleteUser()]);
  } catch (error) {
    console.error('Error clearing secure storage session:', error);
  }
}
