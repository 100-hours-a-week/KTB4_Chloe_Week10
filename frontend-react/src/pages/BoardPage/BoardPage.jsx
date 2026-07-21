import useInfinitePosts from '../../hooks/useInfinitePosts';
import BoardMain from './BoardMain';

// 원본: Page/Board/board.js 전체 — 훅 호출(서버 상태 소유)만 담당하고 나머지는 BoardMain에 위임
// 그냥 useInfinitePosts호출해서 게시글 목록 렌더링 할 때 필요한 상태 값들 가져와서 BoardMain에 props로 전달
function BoardPage() {
  const { posts, isLoading, error, sentinelRef } = useInfinitePosts();

  return <BoardMain posts={posts} isLoading={isLoading} error={error} sentinelRef={sentinelRef} />;
}

export default BoardPage;
