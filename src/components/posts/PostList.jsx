import PostCard from './PostCard';

const PostList = ({ posts }) => (
    <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
            <PostCard key={post._id} post={post} />
        ))}
    </div>
);

export default PostList;