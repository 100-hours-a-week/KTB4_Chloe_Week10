import './CommentCountHeading.css';

function CommentCountHeading({ count }) {
  return (
    <h3 className="comment-count-heading">
      댓글 <span>{count}</span>개
    </h3>
  );
}

export default CommentCountHeading;
