// React Query hooks for admin user-management.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';

export const useUsers = (params = {}) =>
    useQuery({
        queryKey: ['users', 'list', params],
        queryFn: () => usersApi.list(params),
        keepPreviousData: true
    });

export const useUserStats = () =>
    useQuery({
        queryKey: ['users', 'stats'],
        queryFn: () => usersApi.stats()
    });

export const useUpdateUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => usersApi.update(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['users'] });
        }
    });
};

export const useDeleteUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, params }) => usersApi.remove(id, params),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['users'] });
            qc.invalidateQueries({ queryKey: ['posts'] });
        }
    });
};