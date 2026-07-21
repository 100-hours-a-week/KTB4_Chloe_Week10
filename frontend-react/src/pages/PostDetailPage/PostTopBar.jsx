import { Link } from 'react-router-dom';
import { ViewIcon } from '../../components/icons/StatIcons';
import { formatCount } from '../../utils/format';
import './PostTopBar.css';

// 원본: post_detail.html:70-83. 목록으로 가기는 하드 링크 → SPA 라우트(/board)로 변환.
// 수정/삭제 버튼은 원본처럼 항상 렌더링 후 display:none 대신, isOwner일 때만 렌더링.
function PostTopBar({ viewCount, isOwner, onEdit, onRequestDelete }) {
  return (
    <div className="post-top-row">
      <Link to="/board" className="btn-back-inline">
        <span className="icon-chevron-left">‹</span> 목록으로
      </Link>
      <div className="post-top-right">
        <span className="view-count-inline">
          <ViewIcon className="icon-eye" />
          <span>{formatCount(viewCount)}</span>
        </span>
        {isOwner && (
          <>
            <button type="button" className="btn-action" onClick={onEdit}>
              수정
            </button>
            <button type="button" className="btn-action btn-delete-post" onClick={onRequestDelete}>
              삭제
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PostTopBar;
