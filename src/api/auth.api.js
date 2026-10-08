// Auth API wrappers — thin, typed-ish wrappers around the axios client.

import api from './client';

export const authApi = {
    register: (payload) =>
        api.post('/auth/register', payload).then((r) => r.data),

    login: (payload) =>
        api.post('/auth/login', payload).then((r) => r.data),

    logout: () =>
        api.post('/auth/logout').then((r) => r.data),

    logoutAll: () =>
        api.post('/auth/logout-all').then((r) => r.data),

    profile: () =>
        api.get('/auth/profile').then((r) => r.data),

    updateProfile: (payload) =>
        api.put('/auth/profile', payload).then((r) => r.data),

    changePassword: (payload) =>
        api.post('/auth/change-password', payload).then((r) => r.data)
};