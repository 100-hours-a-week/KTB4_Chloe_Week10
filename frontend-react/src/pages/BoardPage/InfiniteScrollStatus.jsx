import './InfiniteScrollStatus.css';

// 원본: board.html의 #postLoading/#postEmpty/#postError 3개 <p>(각각 hidden 토글)를
// 하나의 status 파생값(loading/empty/error/idle)으로 통합.
const MESSAGES = {
  loading: '게시글을 불러오는 중입니다.',
  empty: '등록된 게시글이 없습니다.',
  error: '게시글을 불러오지 못했습니다.',
};

function InfiniteScrollStatus({ status }) {
  if (status === 'idle') return null;
  return <p className="scroll-status">{MESSAGES[status]}</p>;
}

export default InfiniteScrollStatus;
