import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePost, useDeletePost } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatDate';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import LikeButton from '../components/posts/LikeButton';

const PostDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, isAdmin } = useAuth();

    const { data, isLoading, isError, error } = usePost(slug);
    const deleteMutation = useDeletePost();

    if (isLoading) {
        return <Spinner className="py-20" size="lg" />;
    }

    if (isError) {
        const status = error?.response?.status;
        const message =
            status === 404
                ? 'This post does not exist.'
                : status === 403
                ? 'This draft is private.'
                : error?.response?.data?.error || 'Failed to load post.';

        return (
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                    {message}
                </div>
                <Link to="/" className="inline-block mt-4 text-primary-600 hover:underline">
                    ← Back to home
                </Link>
            </div>
        );
    }

    const post = data?.data;
    if (!post) return null;

    const isAuthor =
        isAuthenticated &&
        user?._id &&
        post.author?._id &&
        user._id === post.author._id;
    const canManage = isAuthor || isAdmin;

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Delete "${post.title}"? This cannot be undone.`
        );
        if (!confirmed) return;
        try {
            await deleteMutation.mutateAsync(post._id);
            navigate('/my-posts');
        } catch (err) {
            alert(err?.response?.data?.error || 'Failed to delete post.');
        }
    };

    return (
        <article className="max-w-3xl mx-auto px-4 py-10">
            {/* Draft banner */}
            {post.status === 'draft' && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-3 rounded">
                    <strong>Draft</strong> — only you can see this. Publish it from
                    the edit page when ready.
                </div>
            )}

            <header className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{post.title}</h1>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span>
                        By{' '}
                        <span className="font-medium text-gray-800">
                            {post.author?.name || 'Unknown'}
                        </span>
                    </span>
                    <span>·</span>
                    <span>
                        {post.status === 'published'
                            ? formatDate(post.publishedAt)
                            : 'Not published yet'}
                    </span>
                    <span>·</span>
                    <span>👁️ {post.viewCount} views</span>
                </div>

                {(post.categories?.length > 0 || post.tags?.length > 0) && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {post.categories?.map((cat) => (
                            <Link
                                key={`c-${cat}`}
                                to={`/?category=${encodeURIComponent(cat)}`}
                                className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition"
                                title={`Filter by category: ${cat}`}
                            >
                                {cat}
                            </Link>
                        ))}
                        {post.tags?.map((tag) => (
                            <Link
                                key={`t-${tag}`}
                                to={`/?search=${encodeURIComponent(tag)}`}
                                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
                                title={`Search for #${tag}`}
                            >
                                #{tag}
                            </Link>
                        ))}
                    </div>
                )}
            </header>

            <div className="prose prose-lg max-w-none mb-8">
                {post.content
                    .split(/\n+/)
                    .filter(Boolean)
                    .map((para, i) => (
                        <p key={i} className="mb-4 text-gray-800 leading-relaxed">
                            {para}
                        </p>
                    ))}
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                <LikeButton post={post} />

                {canManage && (
                    <div className="flex gap-2">
                        <Link to={`/my-posts/edit/${post._id}`}>
                            <Button variant="secondary">Edit</Button>
                        </Link>
                        <button
                            onClick={handleDelete}
                            disabled={deleteMutation.isLoading}
                            className="px-4 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition"
                        >
                            {deleteMutation.isLoading ? 'Deleting…' : 'Delete'}
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-8">
                <Link
                    to="/"
                    className="text-sm text-gray-500 hover:text-primary-600"
                >
                    ← Back to home
                </Link>
            </div>
        </article>
    );
};

export default PostDetailPage;