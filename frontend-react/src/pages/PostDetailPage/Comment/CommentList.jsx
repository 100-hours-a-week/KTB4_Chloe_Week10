import { memo } from 'react';
import CommentItem from './CommentItem';
import './CommentList.css';

function CommentList({ comments, onEdit, onRequestDelete }) {
  return (
    <ul className="comment-list">
      {comments.map((comment) => (
        <CommentItem
          key={comment.commentId}
          comment={comment}
          onEdit={onEdit}
          onRequestDelete={onRequestDelete}
        />
      ))}
    </ul>
  );
}

export default memo(CommentList);
