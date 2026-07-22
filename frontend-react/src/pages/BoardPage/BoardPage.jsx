import useInfinitePosts from '../../hooks/useInfinitePosts';
import BoardMain from './BoardMain';

function BoardPage() {
  const { posts, isLoading, error, sentinelRef } = useInfinitePosts();

  return <BoardMain posts={posts} isLoading={isLoading} error={error} sentinelRef={sentinelRef} />;
}

export default BoardPage;
