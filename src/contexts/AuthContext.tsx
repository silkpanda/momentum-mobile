import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { storage } from '../utils/storage';
import { User, LoginResponse, RegisterResponse } from '../types';

interface AuthContextType {
    user: User | null;
    householdId: string | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
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
        console.log('[AuthContext] loadStoredAuth called');
        try {
            const [storedToken, storedUser, storedHouseholdId] = await Promise.all([
                storage.getToken(),
                storage.getUser(),
                storage.getHouseholdId(),
            ]);

            console.log('[AuthContext] Stored data:', {
                hasToken: !!storedToken,
                hasUser: !!storedUser,
                hasHouseholdId: !!storedHouseholdId,
            });

            if (storedToken && storedUser) {
                console.log('[AuthContext] Found stored credentials, setting state');
                setToken(storedToken);
                setUser(storedUser);
                setHouseholdId(storedHouseholdId);

                // Verify token is still valid
                try {
                    console.log('[AuthContext] Verifying token with /auth/me');
                    const response = await api.getMe();
                    if (response.data) {
                        console.log('[AuthContext] Token verified successfully');
                        setUser(response.data.user);
                        setHouseholdId(response.data.householdId);
                    }
                } catch (error: any) {
                    // Only clear auth if we get a 401 (unauthorized), not on network errors
                    console.error('[AuthContext] Token verification failed:', error.message);

                    // Check if this is an authentication error (401) vs network error
                    if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('Invalid token'))) {
                        console.log('[AuthContext] Auth error detected, clearing credentials');
                        await clearAuth();
                    } else {
                        console.log('[AuthContext] Network error, keeping existing credentials');
                        // Keep the stored credentials - this is likely just a network issue
                    }
                }
            } else {
                console.log('[AuthContext] No stored credentials found');
            }
        } catch (error) {
            console.error('[AuthContext] Error loading auth:', error);
            // Don't throw - we want the app to continue loading even if auth fails
        } finally {
            setIsLoading(false);
            console.log('[AuthContext] loadStoredAuth complete, isLoading set to false');
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
