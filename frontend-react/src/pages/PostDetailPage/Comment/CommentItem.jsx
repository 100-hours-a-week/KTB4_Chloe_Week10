import { getProfileImageUrl } from '../../../api/imageRequest';
import { formatDateTime } from '../../../utils/format';
import './CommentItem.css';

// 원본: post_detail.js:208-241 createCommentVNode. data-comment-id 대신 comment를 클로저로
// 가지고 있으므로 onEdit(comment) / onRequestDelete(comment.commentId)로 직접 전달.
function CommentItem({ comment, onEdit, onRequestDelete }) {
  return (
    <li className="comment-item">
      <div className="comment-header">
        <div className="comment-author-wrap">
          <div className="author-avatar comment-avatar">
            {comment.profileImage && (
              <img
                className="comment-author-avatar-img"
                src={getProfileImageUrl(comment.profileImage)}
                alt=""
              />
            )}
          </div>
          <span className="comment-author">{comment.commenter}</span>
          <span className="comment-date">{formatDateTime(comment.commentDateWritten)}</span>
        </div>

        <div className="comment-actions">
          <button type="button" className="btn-action btn-edit-comment" onClick={() => onEdit(comment)}>
            수정
          </button>
          <button
            type="button"
            className="btn-action btn-delete-comment"
            onClick={() => onRequestDelete(comment.commentId)}
          >
            삭제
          </button>
        </div>
      </div>

      <p className="comment-body">{comment.commentContent}</p>
    </li>
  );
}

export default CommentItem;
