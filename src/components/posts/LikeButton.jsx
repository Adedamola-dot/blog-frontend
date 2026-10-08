import { useAuth } from '../../hooks/useAuth';
import { useToggleLike } from '../../hooks/usePosts';

const LikeButton = ({ post }) => {
    const { isAuthenticated } = useAuth();
    const toggle = useToggleLike();

    const userId = useAuth().user?._id;
    const liked = isAuthenticated && userId
        ? post.likes?.some((id) =>
              (typeof id === 'string' ? id : id._id) === userId
          )
        : false;

    const count = post.likes?.length || 0;

    const handleClick = () => {
        if (!isAuthenticated) return;
        toggle.mutate(post._id);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={!isAuthenticated || toggle.isLoading}
            title={isAuthenticated ? 'Toggle like' : 'Log in to like'}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition ${
                liked
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${!isAuthenticated ? 'cursor-not-allowed opacity-60' : ''}`}
        >
            <span>{liked ? '❤️' : '🤍'}</span>
            <span>{count}</span>
        </button>
    );
};

export default LikeButton;