import CommentForm from './CommentForm';
import CommentCountHeading from './CommentCountHeading';
import CommentList from './CommentList';

function CommentSection({
  comments,
  commentCount,
  editingComment,
  onSubmitComment,
  onCancelEdit,
  onEditComment,
  onRequestDeleteComment,
}) {
  return (
    <>
      <CommentForm editingComment={editingComment} onSubmit={onSubmitComment} onCancelEdit={onCancelEdit} />
      <CommentCountHeading count={commentCount} />
      <CommentList comments={comments} onEdit={onEditComment} onRequestDelete={onRequestDeleteComment} />
    </>
  );
}

export default CommentSection;
