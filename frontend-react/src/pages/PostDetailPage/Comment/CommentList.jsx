import { memo } from 'react';
import CommentItem from './CommentItem';
import './CommentList.css';

// 원본: post_detail.html:132 <ul id="commentList">. mini-vdom의 diff/patch 없이
// comments 배열을 그대로 map — key=commentId로 리스트 재조정.
// React.memo: comments 배열 참조가 바뀔 때만 리렌더링. onEdit/onRequestDelete도
// PostDetailPage에서 useCallback으로 안정화돼 있어야 이 memo가 실제로 효과가 있음.
function CommentList({ comments, onEdit, onRequestDelete }) {
  return (
    <ul className="comment-list">
      {comments.map((comment) => (
        <CommentItem
          key={comment.commentId} //Key값으로 commentId 사용
          comment={comment}
          onEdit={onEdit}
          onRequestDelete={onRequestDelete}
        />
      ))}
    </ul>
  );
}

export default memo(CommentList);
