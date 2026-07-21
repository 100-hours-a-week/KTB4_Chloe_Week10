import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePostDetail from '../../hooks/usePostDetail';
import PostDetailMain from './PostDetailMain';

// 원본: Page/Post_detail/post_detail.js — 이번 단계 범위: 게시글 표시+삭제+좋아요+신고(댓글 제외).
// usePostDetail(API/서버 상태)과 deleteModalOpen(로컬 UI 상태)을 소유하고, 실제 렌더링은
// PostDetailMain에 위임(design doc 1-4절 트리 그대로).
function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const {
    post,
    isLiked,
    likeCount,
    commentCount,
    comments,
    editingComment,
    setEditingComment,
    deleteTargetCommentId,
    setDeleteTargetCommentId,
    isLoading,
    error,
    deletePost,
    toggleLike,
    reportPost,
    createComment,
    editComment,
    deleteComment,
  } = usePostDetail(postId);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // 원본 postDeleteConfirmBtn 핸들러(post_detail.js:186-193) — 성공 시 목록으로 이동
  async function handleConfirmDelete() {
    try {
      await deletePost();
      navigate('/board');
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteModalOpen(false);
    }
  }

  // 원본 postReportBtn 핸들러(post_detail.js:428-436) — 성공 시 alert 후 목록으로 이동
  async function handleReport() {
    try {
      await reportPost();
      alert('게시글 신고가 완료되었습니다.');
      navigate('/board');
    } catch (err) {
      console.error(err);
    }
  }

  // 원본 commentSubmitBtn 핸들러(post_detail.js:345-389) — editingComment 유무로 수정/등록 분기
  async function handleSubmitComment(content) {
    if (editingComment) {
      await editComment(content);
    } else {
      await createComment(content);
    }
  }

  // 원본 mountComments 클릭 위임의 editBtn 분기(post_detail.js:267-277) 대응 — CommentItem이 직접 호출
  function handleEditComment(comment) {
    setEditingComment(comment);
  }

  // 원본 mountComments 클릭 위임의 deleteBtn 분기(post_detail.js:280-285) 대응
  function handleRequestDeleteComment(commentId) {
    setDeleteTargetCommentId(commentId);
  }

  // 원본 commentDeleteConfirmBtn 핸들러(post_detail.js:326-341)
  async function handleConfirmDeleteComment() {
    try {
      await deleteComment();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTargetCommentId(null);
    }
  }

  if (error) {
    return <p>게시글 정보를 불러오지 못했습니다.</p>;
  }

  if (isLoading || !post) {
    return <p>게시글을 불러오는 중입니다.</p>;
  }

  return (
    <PostDetailMain
      post={post}
      isLiked={isLiked}
      likeCount={likeCount}
      onEdit={() => navigate(`/posts/${postId}/edit`)}
      onRequestDelete={() => setDeleteModalOpen(true)} //게시글에 있는 삭제 버튼 눌렀을 때
      onToggleLike={toggleLike}
      onReport={handleReport}
      deleteModalOpen={deleteModalOpen}
      onConfirmDelete={handleConfirmDelete} //모달 창의 삭제 확인 버튼
      onCancelDelete={() => setDeleteModalOpen(false)} //모달 창의 삭제 취소 버튼
      comments={comments}
      commentCount={commentCount}
      editingComment={editingComment}
      onSubmitComment={handleSubmitComment}
      onCancelEditComment={() => setEditingComment(null)}
      onEditComment={handleEditComment}
      onRequestDeleteComment={handleRequestDeleteComment}
      commentDeleteModalOpen={deleteTargetCommentId !== null}
      onConfirmDeleteComment={handleConfirmDeleteComment}
      onCancelDeleteComment={() => setDeleteTargetCommentId(null)}
    />
  );
}

export default PostDetailPage;
