import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { storage } from '../utils/storage';
import { User, LoginResponse, RegisterResponse } from '../types';
import { logger } from '../utils/logger';

interface AuthContextType {
    user: User | null;
    householdId: string | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    googleLogin: (idToken: string) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
}

interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    householdName: string;
    userDisplayName: string;
    userProfileColor: string;
    inviteCode?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [householdId, setHouseholdId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load stored auth data on mount
    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        logger.debug('loadStoredAuth called');
        try {
            const [storedToken, storedUser, storedHouseholdId] = await Promise.all([
                storage.getToken(),
                storage.getUser(),
                storage.getHouseholdId(),
            ]);

            logger.debug('Stored data:', {
                hasToken: !!storedToken,
                hasUser: !!storedUser,
                hasHouseholdId: !!storedHouseholdId,
            });

            if (storedToken && storedUser) {
                logger.debug('Found stored credentials, setting state');
                setToken(storedToken);
                setUser(storedUser);
                setHouseholdId(storedHouseholdId);

                // Verify token is still valid
                try {
                    logger.debug('Verifying token with /auth/me');
                    const response = await api.getMe();
                    if (response.data) {
                        logger.info('Token verified successfully');
                        setUser(response.data.user);
                        setHouseholdId(response.data.householdId);
                    }
                } catch (error: any) {
                    // Only clear auth if we get a 401 (unauthorized), not on network errors
                    logger.error('Token verification failed:', error.message);

                    // Check if this is an authentication error (401) vs network error
                    // TEMPORARY FIX: Also catch 500 "Something went wrong" which is how unhandled TokenExpiredError appears
                    if (error.message && (
                        error.message.includes('401') ||
                        error.message.includes('Unauthorized') ||
                        error.message.includes('Invalid token') ||
                        error.message.includes('Something went wrong on the server') // Catch the 500 from expired token
                    )) {
                        logger.warn('Auth error detected (or expired token 500), clearing credentials');
                        await clearAuth();
                    } else {
                        logger.debug('Network error, keeping existing credentials');
                        // Keep the stored credentials - this is likely just a network issue
                    }
                }
            } else {
                logger.debug('No stored credentials found');
            }
        } catch (error) {
            logger.error('Error loading auth:', error);
            // Don't throw - we want the app to continue loading even if auth fails
        } finally {
            setIsLoading(false);
            logger.debug('loadStoredAuth complete, isLoading set to false');
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await api.login(email, password);

            if (response.token && response.data) {
                const newToken = response.token;
                const newUser = response.data.parent;
                const newHouseholdId = response.data.primaryHouseholdId;

                // Store auth data
                await Promise.all([
                    storage.setToken(newToken),
                    storage.setUser(newUser),
                    storage.setHouseholdId(newHouseholdId),
                ]);

                // Update state
                setToken(newToken);
                setUser(newUser);
                setHouseholdId(newHouseholdId);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
        }
    };

    const googleLogin = async (idToken: string) => {
        try {
            const response = await api.googleLogin(idToken);

            if (response.token && response.data) {
                const newToken = response.token;
                const newUser = response.data.parent;
                const newHouseholdId = response.data.primaryHouseholdId;

                // Store auth data
                await Promise.all([
                    storage.setToken(newToken),
                    storage.setUser(newUser),
                    storage.setHouseholdId(newHouseholdId),
                ]);

                // Update state
                setToken(newToken);
                setUser(newUser);
                setHouseholdId(newHouseholdId);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Google login failed');
        }
    };

    const register = async (userData: RegisterData) => {
        try {
            const response = await api.register(userData);

            if (response.token && response.data) {
                const newToken = response.token;
                const newUser = response.data.parent;
                const newHouseholdId = response.data.household._id || response.data.household.id;

                // Store auth data
                await Promise.all([
                    storage.setToken(newToken),
                    storage.setUser(newUser),
                    storage.setHouseholdId(newHouseholdId),
                ]);

                // Update state
                setToken(newToken);
                setUser(newUser);
                setHouseholdId(newHouseholdId);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Registration failed');
        }
    };

    const clearAuth = async () => {
        await storage.clearAll();
        setToken(null);
        setUser(null);
        setHouseholdId(null);
    };

    const logout = async () => {
        await clearAuth();
    };

    const value: AuthContextType = {
        user,
        householdId,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        googleLogin,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
