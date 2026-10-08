// React Query hooks for post data.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../api/posts.api';

// ---------- Queries ----------

export const usePosts = (params = {}) =>
    useQuery({
        queryKey: ['posts', 'list', params],
        queryFn: () => postsApi.list(params),
        keepPreviousData: true
    });

export const usePost = (slug) =>
    useQuery({
        queryKey: ['post', 'slug', slug],
        queryFn: () => postsApi.getBySlug(slug),
        enabled: !!slug
    });

export const usePostById = (id) =>
    useQuery({
        queryKey: ['post', 'id', id],
        queryFn: () => postsApi.getById(id),
        enabled: !!id
    });

export const useMyPosts = (params = {}) =>
    useQuery({
        queryKey: ['posts', 'mine', params],
        queryFn: () => postsApi.myPosts(params)
    });

// ---------- Mutations ----------

export const useToggleLike = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => postsApi.toggleLike(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['posts'] });
            qc.invalidateQueries({ queryKey: ['post'] });
        }
    });
};

export const useCreatePost = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload) => postsApi.create(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['posts'] });
        }
    });
};

export const useUpdatePost = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => postsApi.update(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['posts'] });
            qc.invalidateQueries({ queryKey: ['post'] });
        }
    });
};

export const useDeletePost = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => postsApi.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['posts'] });
        }
    });
};

// ---------- Derived categories ----------

// Derives a sorted list of unique categories from all published posts.
// Uses a big-limit query. Fine for our scale (dozens of posts).

export const useCategories = () => {
    const query = useQuery({
        queryKey: ['posts', 'categories'],
        queryFn: async () => {
            const res = await postsApi.list({ limit: 100 });
            const all = res.data || [];
            const set = new Set();
            for (const p of all) {
                (p.categories || []).forEach((c) => set.add(c));
            }
            return Array.from(set).sort((a, b) => a.localeCompare(b));
        },
        staleTime: 5 * 60 * 1000
    });
    return query.data || [];
};