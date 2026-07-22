import './CommentCountHeading.css';

// 원본: post_detail.html:129 <h3 class="comment-count-heading">
function CommentCountHeading({ count }) {
  return (
    <h3 className="comment-count-heading">
      댓글 <span>{count}</span>개
    </h3>
  );
}

export default CommentCountHeading;
