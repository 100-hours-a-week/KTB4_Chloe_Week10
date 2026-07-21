import CommentForm from './CommentForm';
import CommentCountHeading from './CommentCountHeading';
import CommentList from './CommentList';

// react-migration-design.md 1-4절 트리: CommentForm + CommentCountHeading + CommentList 조립.
// 댓글 삭제용 ConfirmModal은 PostDetailMain에서 형제로 렌더링(게시글 삭제 모달과 동일 레벨).
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
