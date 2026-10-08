import { useQuery } from '@tanstack/react-query';
import { postsApi } from '../api/posts.api';
import { usersApi } from '../api/users.api';
import Spinner from '../components/ui/Spinner';

const StatCard = ({ label, value, hint, accent = 'primary' }) => {
    const accentMap = {
        primary: 'text-primary-600',
        green: 'text-green-600',
        yellow: 'text-yellow-600',
        red: 'text-red-600'
    };
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-sm text-gray-500 mb-1">{label}</div>
            <div className={`text-3xl font-bold ${accentMap[accent]}`}>{value}</div>
            {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
        </div>
    );
};

const AdminStatsPage = () => {
    const postStats = useQuery({
        queryKey: ['posts', 'stats'],
        queryFn: () => postsApi.stats()
    });

    const userStats = useQuery({
        queryKey: ['users', 'stats'],
        queryFn: () => usersApi.stats()
    });

    if (postStats.isLoading || userStats.isLoading) {
        return <Spinner className="py-20" size="lg" />;
    }

    if (postStats.isError || userStats.isError) {
        const err = postStats.error || userStats.error;
        return (
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                    Failed to load stats: {err?.message}
                </div>
            </div>
        );
    }

    const p = postStats.data?.data || {};
    const u = userStats.data?.data || {};

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Stats</h1>
                <p className="text-gray-500 mt-1">Overview of content and community.</p>
            </header>

            {/* Posts section */}
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Posts</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Posts" value={p.totalPosts ?? 0} />
                <StatCard label="Published" value={p.publishedPosts ?? 0} accent="green" />
                <StatCard label="Drafts" value={p.draftPosts ?? 0} accent="yellow" />
                <StatCard
                    label="Total Views"
                    value={(p.totalViews ?? 0).toLocaleString()}
                    accent="primary"
                />
            </div>

            {p.mostLikedPost && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 mb-8">
                    <div className="text-sm text-gray-500 mb-2">Most Liked Post</div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-gray-900">
                                {p.mostLikedPost.title}
                            </div>
                            <div className="text-sm text-gray-500">
                                by {p.mostLikedPost.author?.name || 'Unknown'}
                            </div>
                        </div>
                        <div className="text-2xl">❤️ {p.mostLikedPost.likes}</div>
                    </div>
                </div>
            )}

            {/* Users section */}
            <h2 className="text-lg font-semibold text-gray-800 mb-3 mt-8">Users</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Users" value={u.totalUsers ?? 0} />
                <StatCard label="Active" value={u.activeUsers ?? 0} accent="green" />
                <StatCard label="Inactive" value={u.inactiveUsers ?? 0} accent="red" />
                <StatCard label="Admins" value={u.adminCount ?? 0} accent="primary" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Regular Users" value={u.regularUsers ?? 0} />
                <StatCard
                    label="New (30d)"
                    value={u.newUsersLast30Days ?? 0}
                    accent="green"
                />
            </div>

            {/* Most active users */}
            {u.mostActiveUsers?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-200 text-sm font-medium text-gray-700">
                        Most Active Authors
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs">
                            <tr className="text-left">
                                <th className="px-5 py-2 font-medium">Name</th>
                                <th className="px-5 py-2 font-medium">Email</th>
                                <th className="px-5 py-2 font-medium text-right">Posts</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {u.mostActiveUsers.map((au) => (
                                <tr key={au._id}>
                                    <td className="px-5 py-2 text-gray-800">{au.name}</td>
                                    <td className="px-5 py-2 text-gray-500">{au.email}</td>
                                    <td className="px-5 py-2 text-right text-gray-700 font-medium">
                                        {au.postCount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminStatsPage;