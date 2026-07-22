import CommentItem from './CommentItem';
import './CommentList.css';

// 원본: post_detail.html:132 <ul id="commentList">. mini-vdom의 diff/patch 없이
// comments 배열을 그대로 map — key=commentId로 리스트 재조정.
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

export default CommentList;
