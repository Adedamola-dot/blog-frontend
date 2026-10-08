import { useState } from 'react';
import { useUsers, useUpdateUser, useDeleteUser } from '../hooks/useUsers';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatDate';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const RoleBadge = ({ role }) => {
    const colors = {
        admin: 'bg-primary-50 text-primary-700',
        moderator: 'bg-purple-50 text-purple-700',
        user: 'bg-gray-100 text-gray-700'
    };
    return (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[role] || colors.user}`}>
            {role}
        </span>
    );
};

const AdminUsersPage = () => {
    const { user: currentUser } = useAuth();
    const [roleFilter, setRoleFilter] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    const params = { page, limit };
    if (roleFilter) params.role = roleFilter;
    if (activeFilter) params.isActive = activeFilter;
    if (search.trim()) params.search = search.trim();

    const { data, isLoading, isError, error, isFetching } = useUsers(params);
    const updateMutation = useUpdateUser();
    const deleteMutation = useDeleteUser();

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateMutation.mutateAsync({
                id: userId,
                payload: { role: newRole }
            });
        } catch (err) {
            alert(err?.response?.data?.error || 'Failed to update role');
        }
    };

    const handleToggleActive = async (u) => {
        try {
            await updateMutation.mutateAsync({
                id: u._id,
                payload: { isActive: !u.isActive }
            });
        } catch (err) {
            alert(err?.response?.data?.error || 'Failed to update status');
        }
    };

    const handleDelete = async (u) => {
        const confirmed = window.confirm(
            `Delete user "${u.name}" (${u.email})?\n\nTheir posts will remain but be orphaned unless you choose to delete them separately.`
        );
        if (!confirmed) return;
        try {
            await deleteMutation.mutateAsync({ id: u._id, params: {} });
        } catch (err) {
            alert(err?.response?.data?.error || 'Failed to delete user');
        }
    };

    if (isLoading) return <Spinner className="py-20" size="lg" />;

    if (isError) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                    Failed to load users: {error.message}
                </div>
            </div>
        );
    }

    const users = data?.data || [];
    const pagination = data?.pagination;
    const total = data?.total || 0;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Users</h1>
                <p className="text-gray-500 mt-1">{total} user(s) total</p>
            </header>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-center">
                <input
                    type="text"
                    placeholder="Search name or email…"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="input-field max-w-xs"
                />

                <select
                    value={roleFilter}
                    onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setPage(1);
                    }}
                    className="input-field max-w-[160px]"
                >
                    <option value="">All roles</option>
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                </select>

                <select
                    value={activeFilter}
                    onChange={(e) => {
                        setActiveFilter(e.target.value);
                        setPage(1);
                    }}
                    className="input-field max-w-[160px]"
                >
                    <option value="">All statuses</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>

                {(search || roleFilter || activeFilter) && (
                    <button
                        onClick={() => {
                            setSearch('');
                            setRoleFilter('');
                            setActiveFilter('');
                            setPage(1);
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {users.length === 0 ? (
                <EmptyState title="No users match your filters" />
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr className="text-left text-gray-600">
                                <th className="px-4 py-3 font-medium">User</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Joined</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((u) => {
                                const isSelf = u._id === currentUser?._id;
                                return (
                                    <tr key={u._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">
                                                {u.name}
                                                {isSelf && (
                                                    <span className="text-xs text-gray-400 ml-2">
                                                        (you)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-gray-500 text-xs">
                                                {u.email}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <RoleBadge role={u.role} />
                                                <select
                                                    value={u.role}
                                                    onChange={(e) =>
                                                        handleRoleChange(u._id, e.target.value)
                                                    }
                                                    disabled={isSelf || updateMutation.isLoading}
                                                    className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white disabled:opacity-50"
                                                    title={isSelf ? 'Cannot change your own role' : 'Change role'}
                                                >
                                                    <option value="user">user</option>
                                                    <option value="moderator">moderator</option>
                                                    <option value="admin">admin</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                    u.isActive
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'bg-red-50 text-red-700'
                                                }`}
                                            >
                                                {u.isActive ? 'active' : 'inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-xs">
                                            {formatDate(u.createdAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleActive(u)}
                                                    disabled={isSelf || updateMutation.isLoading}
                                                    className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 transition"
                                                >
                                                    {u.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u)}
                                                    disabled={isSelf || deleteMutation.isLoading}
                                                    className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50 transition"
                                                    title={isSelf ? 'Cannot delete yourself' : 'Delete user'}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={!pagination.hasPrevPage || isFetching}
                        className="btn-secondary disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!pagination.hasNextPage || isFetching}
                        className="btn-secondary disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;