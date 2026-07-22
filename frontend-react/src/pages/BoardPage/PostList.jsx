import PostCard from '../../components/PostCard/PostCard';
import './PostList.css';

function PostList({ posts }) {
  return (
    <ul className="post-list">
      {posts.map((post) => (
        <PostCard key={post.post_id} post={post} />
      ))}
    </ul>
  );
}

export default PostList;
