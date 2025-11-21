// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { storage } from '../utils/storage';

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'Parent' | 'Child';
}

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
        try {
            const [storedToken, storedUser, storedHouseholdId] = await Promise.all([
                storage.getToken(),
                storage.getUser(),
                storage.getHouseholdId(),
            ]);

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(storedUser);
                setHouseholdId(storedHouseholdId);

                // Verify token is still valid
                try {
                    const response = await api.getMe();
                    if (response.data) {
                        setUser(response.data.user);
                        setHouseholdId(response.data.householdId);
                    }
                } catch (error) {
                    // Token invalid, clear auth
                    await clearAuth();
                }
            }
        } catch (error) {
            console.error('Error loading auth:', error);
        } finally {
            setIsLoading(false);
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
                const newHouseholdId = response.data.household._id;

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
