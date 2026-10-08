// AuthContext — holds the current user, exposes login/logout helpers.
// Listens for the 'auth:logout' event from api/client.js so any failed
// refresh automatically clears state and sends the UI to /login.

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/auth.api';
import { tokenStore } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // true until we've checked the token once

    // On mount: if a token exists, try to fetch the profile.
    // If it fails, we simply start as logged-out.
    useEffect(() => {
        const bootstrap = async () => {
            if (!tokenStore.getAccess()) {
                setLoading(false);
                return;
            }
            try {
                const res = await authApi.profile();
                setUser(res.data);
            } catch {
                tokenStore.clear();
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        bootstrap();
    }, []);

    // React to forced-logout event from api/client.js
    useEffect(() => {
        const onLogout = () => setUser(null);
        window.addEventListener('auth:logout', onLogout);
        return () => window.removeEventListener('auth:logout', onLogout);
    }, []);

    const login = useCallback(async ({ email, password }) => {
        const res = await authApi.login({ email, password });
        tokenStore.set(res.data.accessToken, res.data.refreshToken);
        setUser(res.data.user);
        return res.data.user;
    }, []);

    const register = useCallback(async (payload) => {
        const res = await authApi.register(payload);
        tokenStore.set(res.data.accessToken, res.data.refreshToken);
        setUser(res.data.user);
        return res.data.user;
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch {
            // Ignore — even if the server call fails, we clear locally
        }
        tokenStore.clear();
        setUser(null);
    }, []);

       const refreshUser = useCallback(async () => {
        try {
            const res = await authApi.profile();
            setUser(res.data);
            return res.data;
        } catch {
            // If the profile fetch fails, tokens are likely dead — log out.
            tokenStore.clear();
            setUser(null);
            return null;
        }
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
    return ctx;
};