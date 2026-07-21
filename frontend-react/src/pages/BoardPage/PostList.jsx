import PostCard from '../../components/PostCard/PostCard';
import './PostList.css';

// 원본: frontend/Page/Board/board.html:79 <ul class="post-list"> + board.js:133 forEach 렌더
function PostList({ posts }) {
  return (
    <ul className="post-list">
      {posts.map((post) => (
        //key 값을 서버에서 내려준 post_id 값으로 해서 배열로 내려오는 값 렌더링
        <PostCard key={post.post_id} post={post} />
      ))}
    </ul>
  );
}

export default PostList;
