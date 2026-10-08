import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyPosts, useDeletePost } from '../hooks/usePosts';
import { formatDate } from '../utils/formatDate';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

const StatusBadge = ({ status }) => (
    <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            status === 'published'
                ? 'bg-green-50 text-green-700'
                : 'bg-yellow-50 text-yellow-700'
        }`}
    >
        {status}
    </span>
);

const MyPostsPage = () => {
    const [statusFilter, setStatusFilter] = useState('');
    const params = statusFilter ? { status: statusFilter } : {};

    const { data, isLoading, isError, error } = useMyPosts(params);
    const deleteMutation = useDeletePost();

    const handleDelete = async (post) => {
        const confirmed = window.confirm(
            `Delete "${post.title}"? This cannot be undone.`
        );
        if (!confirmed) return;
        try {
            await deleteMutation.mutateAsync(post._id);
        } catch (err) {
            alert(err?.response?.data?.error || 'Failed to delete post.');
        }
    };

    if (isLoading) return <Spinner className="py-20" size="lg" />;

    if (isError) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                    Failed to load your posts: {error.message}
                </div>
            </div>
        );
    }

    const posts = data?.data || [];
    const total = data?.total || 0;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Posts</h1>
                    <p className="text-gray-500 mt-1">{total} post(s)</p>
                </div>
                <Link to="/my-posts/new">
                    <Button>New Post</Button>
                </Link>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6">
                {[
                    { label: 'All', value: '' },
                    { label: 'Published', value: 'published' },
                    { label: 'Drafts', value: 'draft' }
                ].map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setStatusFilter(opt.value)}
                        className={`px-3 py-1.5 text-sm rounded-md transition ${
                            statusFilter === opt.value
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {posts.length === 0 ? (
                <EmptyState
                    title="No posts yet"
                    message={
                        statusFilter
                            ? `You have no ${statusFilter} posts.`
                            : "You haven't written anything yet."
                    }
                    action={
                        <Link to="/my-posts/new" className="btn-primary inline-block">
                            Write your first post
                        </Link>
                    }
                />
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {posts.map((post) => (
                        <div
                            key={post._id}
                            className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-gray-50"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <StatusBadge status={post.status} />
                                    <span className="text-xs text-gray-500">
                                        {post.status === 'published'
                                            ? formatDate(post.publishedAt)
                                            : `updated ${formatDate(post.updatedAt)}`}
                                    </span>
                                </div>
                                <Link
                                    to={`/post/${post.slug}`}
                                    className="font-medium text-gray-900 hover:text-primary-600 line-clamp-1"
                                >
                                    {post.title}
                                </Link>
                                <p className="text-xs text-gray-500 mt-1">
                                    👁️ {post.viewCount} · ❤️ {post.likes?.length || 0}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <Link
                                    to={`/my-posts/edit/${post._id}`}
                                    className="text-sm px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(post)}
                                    disabled={deleteMutation.isLoading}
                                    className="text-sm px-3 py-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyPostsPage;