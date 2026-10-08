// Posts API wrappers.

import api from './client';

export const postsApi = {
    list: (params = {}) =>
        api.get('/posts', { params }).then((r) => r.data),

    getById: (id) =>
        api.get(`/posts/${id}`).then((r) => r.data),

    getBySlug: (slug) =>
        api.get(`/posts/slug/${slug}`).then((r) => r.data),

    myPosts: (params = {}) =>
        api.get('/posts/my-posts', { params }).then((r) => r.data),

    create: (payload) =>
        api.post('/posts', payload).then((r) => r.data),

    update: (id, payload) =>
        api.put(`/posts/${id}`, payload).then((r) => r.data),

    remove: (id) =>
        api.delete(`/posts/${id}`).then((r) => r.data),

    toggleLike: (id) =>
        api.post(`/posts/${id}/like`).then((r) => r.data),

    stats: () =>
        api.get('/posts/stats').then((r) => r.data)
};