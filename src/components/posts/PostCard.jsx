import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';

const PostCard = ({ post }) => {
    const author = post.author;
    const authorName = typeof author === 'object' ? author.name : 'Unknown';

    const snippet =
        post.excerpt ||
        (post.content
            ? post.content.slice(0, 160) + (post.content.length > 160 ? '...' : '')
            : '');

    return (
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition p-5 flex flex-col">
            <Link to={`/post/${post.slug}`} className="block">
                <h2 className="text-xl font-semibold text-gray-900 hover:text-primary-600 mb-2">
                    {post.title}
                </h2>
            </Link>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{snippet}</p>

            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                    <span>By {authorName}</span>
                    <span>·</span>
                    <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span title="Views">👁️ {post.viewCount}</span>
                    <span title="Likes">❤️ {post.likes?.length || 0}</span>
                </div>
            </div>

            {post.categories?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                    {post.categories.map((cat) => (
                        <span
                            key={cat}
                            className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full"
                        >
                            {cat}
                        </span>
                    ))}
                </div>
            )}
        </article>
    );
};

export default PostCard;