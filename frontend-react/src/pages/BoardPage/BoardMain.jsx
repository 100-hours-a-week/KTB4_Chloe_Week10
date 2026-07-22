import { Link } from 'react-router-dom';
import PostList from './PostList';
import InfiniteScrollStatus from './InfiniteScrollStatus';
import ScrollSentinel from './ScrollSentinel';
import './BoardMain.css';

function getStatus({ isLoading, error, posts }) {
  if (error) return 'error';
  if (isLoading) return 'loading';
  if (posts.length === 0) return 'empty';
  return 'idle';
}

function BoardMain({ posts, isLoading, error, sentinelRef }) {

  const status = getStatus({ isLoading, error, posts });

  return (
    <>
      <div className="top-area">
        <p className="greeting">
          안녕하세요,
          <br />
          FitMate <strong className="greeting-bold">게시판</strong> 입니다.
        </p>
        <Link to="/posts/write" className="btn-write">
          게시글 작성
        </Link>
      </div>

      <PostList posts={posts} />
      <InfiniteScrollStatus status={status} />
      <ScrollSentinel sentinelRef={sentinelRef} />
    </>
  );
}

export default BoardMain;
