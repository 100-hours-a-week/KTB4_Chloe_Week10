import PostTopBar from './PostTopBar';
import PostHeader from './PostHeader';
import PostEngagementRow from './PostEngagementRow';
import CommentSection from './CommentSection';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import './PostDetailMain.css';

// react-migration-design.md 1-4절 트리 그대로: PostDetailPage가 훅/네비게이션을 소유하고,
// 이 컴포넌트는 그 값을 받아 하위로 분배만 하는 순수 조립 컴포넌트(자체 상태 없음).
function PostDetailMain({
  post,
  isLiked,
  likeCount,
  onEdit,
  onRequestDelete,
  onToggleLike,
  onReport,
  deleteModalOpen,
  onConfirmDelete,
  onCancelDelete,
  comments,
  commentCount,
  editingComment,
  onSubmitComment,
  onCancelEditComment,
  onEditComment,
  onRequestDeleteComment,
  commentDeleteModalOpen,
  onConfirmDeleteComment,
  onCancelDeleteComment,
}) {
  return (
    <article className="post-detail">
      <PostTopBar
        viewCount={post.view_count}
        isOwner={post.isOwner}
        onEdit={onEdit}
        onRequestDelete={onRequestDelete}
      />

      <PostHeader post={post} />

      <PostEngagementRow
        liked={isLiked}
        likeCount={likeCount}
        onToggleLike={onToggleLike}
        onReport={onReport}
      />

      <CommentSection
        comments={comments}
        commentCount={commentCount}
        editingComment={editingComment}
        onSubmitComment={onSubmitComment}
        onCancelEdit={onCancelEditComment}
        onEditComment={onEditComment}
        onRequestDeleteComment={onRequestDeleteComment}
      />

      <ConfirmModal
        open={deleteModalOpen}
        title="게시글을 삭제하시겠습니까?"
        description="삭제한 내용은 복구할 수 없습니다."
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />

      <ConfirmModal
        open={commentDeleteModalOpen}
        title="댓글을 삭제하시겠습니까?"
        description="삭제한 내용은 복구할 수 없습니다."
        onConfirm={onConfirmDeleteComment}
        onCancel={onCancelDeleteComment}
      />
    </article>
  );
}

export default PostDetailMain;
