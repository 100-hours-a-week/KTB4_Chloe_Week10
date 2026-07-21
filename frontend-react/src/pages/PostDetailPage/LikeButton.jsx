import { LikeIcon } from '../../components/icons/StatIcons';
import { formatCount } from '../../utils/format';
import './LikeButton.css';

// 원본: post_detail.html:106-109. 완전 제어 컴포넌트 — liked/likeCount/onToggle 모두 상위(PostDetailPage,
// usePostDetail)가 소유. 클릭 시 API 호출/분기는 여기서 하지 않고 onToggle(=usePostDetail의 toggleLike)에 위임.
function LikeButton({ liked, likeCount, onToggle }) {
  return (
    <button type="button" className={`btn-like-heart${liked ? ' liked' : ''}`} onClick={onToggle}>
      <LikeIcon className="icon-heart" />
      <span className="like-count">{formatCount(likeCount)}</span>
    </button>
  );
}

export default LikeButton;
