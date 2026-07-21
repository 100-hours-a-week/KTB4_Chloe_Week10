import { Link } from 'react-router-dom';
import PostList from './PostList';
import InfiniteScrollStatus from './InfiniteScrollStatus';
import ScrollSentinel from './ScrollSentinel';
import './BoardMain.css';

// 원본: board.html:72-83. useInfinitePosts()의 반환값을 그대로 props로 받아 하위 컴포넌트에 분배한다
// (BoardPage가 <BoardMain {...useInfinitePosts()} />로 그대로 스프레드할 수 있는 모양).

// status는 원본처럼 loading/empty/error 3개 <p>를 독립적으로 토글하지 않고 하나의 파생값으로 계산.
// 원본은 postEmpty.hidden을 다시 false로 되돌리는 코드가 없어 "빈 목록" 문구가 실제로는 뜨지 않던
// 버그가 있었음 — 여기서는 posts.length === 0으로 정상 동작하도록 함(의도적 수정).
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
      {/* 여기서 가장 PostList밑에 sentinel이 렌더링 되도록  */}
      <ScrollSentinel sentinelRef={sentinelRef} />
    </>
  );
}

export default BoardMain;
