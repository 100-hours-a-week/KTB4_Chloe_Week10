import { useCallback, useState } from 'react';
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

  // PostTopBar/ConfirmModal은 인스턴스가 1개뿐이고 렌더 비용도 작아서, 참조 안정화로 건너뛰는
  // 렌더링의 이득이 useCallback 자체 비용보다 작다고 보고 일반 함수로 둠(과도한 메모이제이션 방지).
  const onEdit = () => navigate(`/posts/${postId}/edit`);
  const onRequestDelete = () => setDeleteModalOpen(true);
  const onCancelDelete = () => setDeleteModalOpen(false);

  // 원본 postDeleteConfirmBtn 핸들러(post_detail.js:186-193) — 성공 시 목록으로 이동
  // ConfirmModal(React.memo)에 onConfirm으로 내려가므로 참조 안정화. deletePost는 훅에서 이미
  // useCallback으로 안정화된 참조라 postId가 안 바뀌는 한 이 콜백도 안 바뀜.
  const handleConfirmDelete = useCallback(async () => {
    try {
      await deletePost();
      navigate('/board');
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteModalOpen(false);
    }
  }, [deletePost, navigate]);

  // 원본 postReportBtn 핸들러(post_detail.js:428-436) — 성공 시 alert 후 목록으로 이동
  // ReportButton은 memo 대상이 아니라 필수는 아니지만, reportPost가 이미 안정 참조라 비용 없이 통일.
  const handleReport = useCallback(async () => {
    try {
      await reportPost();
      alert('게시글 신고가 완료되었습니다.');
      navigate('/board');
    } catch (err) {
      console.error(err);
    }
  }, [reportPost, navigate]);

  // 원본 commentSubmitBtn 핸들러(post_detail.js:345-389) — editingComment 유무로 수정/등록 분기
  // CommentForm은 memo 대상이 아니라서 useCallback 없이도 무방 — 그대로 둠(불필요한 안정화 방지).
  async function handleSubmitComment(content) {
    if (editingComment) {
      await editComment(content);
    } else {
      await createComment(content);
    }
  }

  // 원본 mountComments 클릭 위임의 editBtn 분기(post_detail.js:267-277) 대응 — CommentItem이 직접 호출
  // CommentList/CommentItem(둘 다 React.memo)에 onEdit으로 내려가므로 참조 안정화.
  // setEditingComment는 usePostDetail 내부 useState의 setter라 실제로는 항상 안정적이지만,
  // 커스텀 훅을 거쳐 내려오면 ESLint가 그걸 못 알아채서 exhaustive-deps 경고가 나 명시적으로 추가.

  // React에서 set함수는 항상 같은 참조를 유지한다. (처음 마운트 시점에 딱 하나만 만들어두고, 이게 렌더가 된다고 해서 새로 만들어지지 않는다.)
  const handleEditComment = useCallback((comment) => setEditingComment(comment), [setEditingComment]);

  // 원본 mountComments 클릭 위임의 deleteBtn 분기(post_detail.js:280-285) 대응
  // CommentList/CommentItem에 onRequestDelete로 내려가므로 참조 안정화.
  const handleRequestDeleteComment = useCallback(
    (commentId) => setDeleteTargetCommentId(commentId),
    [setDeleteTargetCommentId]
  );

  // 버그 수정: 지금 CommentForm에서 수정 중인 댓글을 삭제하면 editingComment가 삭제된 댓글 객체를
  // 계속 참조하고 있어서, 입력창 프리필/버튼 라벨("댓글 수정")이 그대로 남아있던 문제.
  const isDeletingEditingComment =
    editingComment !== null && editingComment.commentId === deleteTargetCommentId;
  const commentDeleteModalDescription = isDeletingEditingComment
    ? '현재 수정 중인 댓글입니다.'
    : '삭제한 내용은 복구할 수 없습니다.';

  // 원본 commentDeleteConfirmBtn 핸들러(post_detail.js:326-341)
  // ConfirmModal(댓글 삭제용, React.memo)에 onConfirm으로 내려가므로 참조 안정화.
  // deleteComment는 훅 내부에서 deleteTargetCommentId에 의존하므로, 그 값이 바뀔 때만 이 콜백도 바뀜
  // (어차피 그 시점엔 open 여부도 함께 바뀌어 모달이 다시 렌더링되므로 문제 없음).
  // 삭제 성공 시, 지금 수정 중이던 댓글을 지운 거라면 editingComment도 null로 되돌려서
  // CommentForm이 등록 모드로 리셋되게 함(프리필 텍스트/버튼 라벨 원상복구).
  const handleConfirmDeleteComment = useCallback(async () => {
    try {
      await deleteComment();
      if (isDeletingEditingComment) {
        setEditingComment(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTargetCommentId(null);
    }
  }, [deleteComment, isDeletingEditingComment, setEditingComment, setDeleteTargetCommentId]);

  // ConfirmModal(댓글 삭제용)도 인스턴스 1개+가벼운 렌더라 일반 함수로 둠(위 onCancelDelete와 동일 이유).
  const onCancelDeleteComment = () => setDeleteTargetCommentId(null);

  // CommentForm은 memo 대상이 아니라서 안정화 불필요 — 그대로 둠.
  const onCancelEditComment = () => setEditingComment(null);

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
      onEdit={onEdit}
      onRequestDelete={onRequestDelete} //게시글에 있는 삭제 버튼 눌렀을 때
      onToggleLike={toggleLike}
      onReport={handleReport}
      deleteModalOpen={deleteModalOpen}
      onConfirmDelete={handleConfirmDelete} //모달 창의 삭제 확인 버튼
      onCancelDelete={onCancelDelete} //모달 창의 삭제 취소 버튼
      comments={comments}
      commentCount={commentCount}
      editingComment={editingComment}
      onSubmitComment={handleSubmitComment}
      onCancelEditComment={onCancelEditComment}
      onEditComment={handleEditComment}
      onRequestDeleteComment={handleRequestDeleteComment}
      commentDeleteModalOpen={deleteTargetCommentId !== null}
      commentDeleteModalDescription={commentDeleteModalDescription}
      onConfirmDeleteComment={handleConfirmDeleteComment}
      onCancelDeleteComment={onCancelDeleteComment}
    />
  );
}

export default PostDetailPage;
