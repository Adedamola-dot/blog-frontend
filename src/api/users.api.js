// Admin user-management API wrappers.

import api from './client';

export const usersApi = {
    list: (params = {}) =>
        api.get('/users', { params }).then((r) => r.data),

    getById: (id) =>
        api.get(`/users/${id}`).then((r) => r.data),

    update: (id, payload) =>
        api.put(`/users/${id}`, payload).then((r) => r.data),

    remove: (id, params = {}) =>
        api.delete(`/users/${id}`, { params }).then((r) => r.data),

    stats: () =>
        api.get('/users/stats').then((r) => r.data)
};