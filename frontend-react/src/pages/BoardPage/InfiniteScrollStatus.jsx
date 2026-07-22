import './InfiniteScrollStatus.css';

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
