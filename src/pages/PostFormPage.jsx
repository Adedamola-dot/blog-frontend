import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { usePostById, useCreatePost, useUpdatePost, useDeletePost } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import PostForm from '../components/posts/PostForm';
import Spinner from '../components/ui/Spinner';

// Helpers: convert "a, b, c" <-> ["a","b","c"]
const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return [];
    return value.split(',').map((s) => s.trim()).filter(Boolean);
};
const fromArray = (arr) => (Array.isArray(arr) ? arr.join(', ') : '');

const PostFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const isEdit = !!id;

    const [serverError, setServerError] = useState('');

    const postQuery = usePostById(id);
    const createMutation = useCreatePost();
    const updateMutation = useUpdatePost();
    const deleteMutation = useDeletePost();

    if (isEdit) {
        if (postQuery.isLoading) return <Spinner className="py-20" size="lg" />;

        if (postQuery.isError) {
            const status = postQuery.error?.response?.status;
            const message =
                status === 404
                    ? 'Post not found.'
                    : postQuery.error?.response?.data?.error || 'Failed to load post.';
            return (
                <div className="max-w-3xl mx-auto px-4 py-12">
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                        {message}
                    </div>
                    <Link to="/my-posts" className="inline-block mt-4 text-primary-600 hover:underline">
                        ← Back to My Posts
                    </Link>
                </div>
            );
        }

        const post = postQuery.data?.data;
        if (!post) return null;

        const isAuthor = user?._id && post.author?._id && user._id === post.author._id;
        const canEdit = isAuthor || isAdmin;

        if (!canEdit) {
            return (
                <div className="max-w-3xl mx-auto px-4 py-12">
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                        You do not have permission to edit this post.
                    </div>
                    <Link to="/my-posts" className="inline-block mt-4 text-primary-600 hover:underline">
                        ← Back to My Posts
                    </Link>
                </div>
            );
        }

        const handleUpdate = async (data) => {
            setServerError('');
            const payload = {
                title: data.title.trim(),
                content: data.content.trim(),
                excerpt: data.excerpt?.trim() || '',
                status: data.status,
                categories: toArray(data.categories),
                tags: toArray(data.tags),
                featuredImage: data.featuredImage?.trim() || ''
            };
            try {
                const res = await updateMutation.mutateAsync({ id: post._id, payload });
                navigate(`/post/${res.data.slug}`);
            } catch (err) {
                const msg =
                    err?.response?.data?.error ||
                    err?.response?.data?.details?.[0]?.message ||
                    'Failed to update post.';
                setServerError(msg);
            }
        };

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
            <div className="max-w-3xl mx-auto px-4 py-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Created {new Date(post.createdAt).toLocaleDateString()} ·{' '}
                            {post.status}
                        </p>
                    </div>
                    <button
                        onClick={handleDelete}
                        disabled={deleteMutation.isLoading}
                        className="px-3 py-1.5 text-sm rounded-md bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50 transition"
                    >
                        {deleteMutation.isLoading ? 'Deleting…' : 'Delete post'}
                    </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <PostForm
                        initialValues={{
                            title: post.title,
                            content: post.content,
                            excerpt: post.excerpt || '',
                            status: post.status,
                            categories: fromArray(post.categories),
                            tags: fromArray(post.tags),
                            featuredImage: post.featuredImage || ''
                        }}
                        onSubmit={handleUpdate}
                        submitLabel="Save changes"
                        loading={updateMutation.isLoading}
                        serverError={serverError}
                    />
                </div>
            </div>
        );
    }

    // --- Create mode ---
    const handleCreate = async (data) => {
        setServerError('');
        const payload = {
            title: data.title.trim(),
            content: data.content.trim(),
            excerpt: data.excerpt?.trim() || '',
            status: data.status,
            categories: toArray(data.categories),
            tags: toArray(data.tags),
            featuredImage: data.featuredImage?.trim() || ''
        };
        try {
            const res = await createMutation.mutateAsync(payload);
            navigate(`/post/${res.data.slug}`);
        } catch (err) {
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.details?.[0]?.message ||
                'Failed to create post.';
            setServerError(msg);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Write a New Post</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Save as draft to work on it later, or publish when ready.
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <PostForm
                    onSubmit={handleCreate}
                    submitLabel="Create post"
                    loading={createMutation.isLoading}
                    serverError={serverError}
                />
            </div>
        </div>
    );
};

export default PostFormPage;