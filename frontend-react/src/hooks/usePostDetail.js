import { useEffect, useState } from 'react';
import request from '../api/request';

// 원본: frontend/Page/Post_detail/post_detail.js

//게시글 상세 조회 
async function getDetailPost(postId) {
  return request(`/posts/${postId}`, 'GET');
}

//게시글 삭제
async function deletePost(postId) {
  return request(`/posts/${postId}`, 'DELETE');
}

//게시글 좋아요 등록
async function likePost(postId) {
  return request(`/posts/${postId}/like`, 'POST');
}

//게시글 좋아요 취소
async function unlikePost(postId) {
  return request(`/posts/${postId}/like`, 'DELETE');
}

//게시글 신고
async function reportPost(postId) {
  return request(`/posts/${postId}/declaration`, 'POST');
}

//댓글 생성
async function createComment(postId, commentData) {
  return request(`/posts/${postId}/comment`, 'POST', commentData);
}

//댓글 수정
async function editComment(postId, commentId, commentData) {
  return request(`/posts/${postId}/comment/${commentId}`, 'PUT', commentData);
}

//댓글 삭제
async function deleteComment(postId, commentId) {
  return request(`/posts/${postId}/comment/${commentId}`, 'DELETE');
}

function usePostDetail(postId) {
  const [post, setPost] = useState(null); // isOwner 포함 — 서버가 계산해서 내려주는 그대로 보관
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  const [comments, setComments] = useState([]); // post_detail.js:127 `let comments = []` 대응 (부록 참고)
  const [editingComment, setEditingComment] = useState(null); // 수정 대상 댓글 객체 또는 null (currentEditCommentId/Body 대응)
  // editingComment는 댓글 입력창에 수정하려는 댓글의 본문이 떠야하기 때문에 댓글 객체 전체를 저장
  const [deleteTargetCommentId, setDeleteTargetCommentId] = useState(null); // currentDeleteCommentId 대응


  const [isLoading, setIsLoading] = useState(true); //로딩중인지
  const [error, setError] = useState(false); //에러났는지

  useEffect(() => {
    let cancelled = false;

    //여기서는 async 방식 사용 - 가독성 측면에서 
    //then 방식을 사용하게 되면 try-catch-finally가 아니라 then,catch,finally가 분리된 함수로 작성됨.
    // 에러처리가 딱히 없다면 then을 쓰는 패턴으로 -> PostEditPage
    //postEditPage에서 postId 변경될 때, 응답 데이터 덮어쓰는 문제 해결하는 패턴과 동일 
    async function load() {
      setIsLoading(true);
      setError(false);

      try {
        const result = await getDetailPost(postId);
        if (cancelled) return;

        // 원본 post_detail.js:133-165 — post/is_liked/comment_count가 서로 다른 depth에서 내려옴
        // 응답을 맞춰줘야하나..?
        setPost(result.data.post);
        setIsLiked(Boolean(result.data.is_liked));
        setLikeCount(result.data.post.like_count);
        setCommentCount(result.data.post.comment_count);
        setComments(result.data.comments);

      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    //load() 함수를 실행해야지 getDetailPost 함수 실행
    load();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  // 원본 likeBtn 클릭 핸들러(post_detail.js:402-419)의 분기를 그대로 재현.
  // 좋아요 응답의 like_count는 초기 조회와 달리 result.data.like_count(post 밖)에 있음에 주의. 
  // API 실패 시 그대로 throw — 성공했을 때만 isLiked/likeCount 갱신(원본도 catch 안에서 상태를 안 건드림)
  async function toggleLike() {

    //현재 상태가 true면 unlikePost 호출하고, false면 likePost 호출 
    const result = isLiked ? await unlikePost(postId) : await likePost(postId);
    // 이전 좋아요 상태의 반대값으로 변경
    setIsLiked((prev) => !prev);
    setLikeCount(result.data.like_count);

  }

  // 원본 commentSubmitBtn else 분기(post_detail.js:372-380) — 새 댓글을 배열 맨 앞에 추가(prepend 대응)
  async function addComment(commentContent) {
    const result = await createComment(postId, { commentContent });
    setComments((prev) => [result.data, ...prev]); //기존 댓글 배열에 앞에 생성 -> 최신순으로 보이도록
    setCommentCount(result.data.commentCount);
  }

  // 원본 commentSubmitBtn if(isEditing) 분기(post_detail.js:352-365) — 수정 대상 댓글만 map으로 교체
  async function updateComment(commentContent) {
    const result = await editComment(postId, editingComment.commentId, { commentContent });
    setComments((prev) =>
      prev.map((comment) =>
        comment.commentId === editingComment.commentId
          ? { ...comment, commentContent: result.data.commentContent }
          : comment
      ) //이전 댓글 목록에서 editingComment의 Id와 일치하는 댓글의 내용만 수정
    );

    setEditingComment(null); //수정끝나고 나면 다시 null로 
  }

  // 원본 commentDeleteConfirmBtn 핸들러(post_detail.js:326-341) — 삭제 대상만 filter로 제외
  async function removeComment() {
    const result = await deleteComment(postId, deleteTargetCommentId);
    setComments((prev) => prev.filter((comment) => comment.commentId !== deleteTargetCommentId)); //deleteTargetCommentId와 같은 댓글 Id는 삭제
    setCommentCount(result.data.commentCount);
    setDeleteTargetCommentId(null);
  }

  return {
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
    deletePost: () => deletePost(postId),
    toggleLike,
    reportPost: () => reportPost(postId),
    createComment: addComment,
    editComment: updateComment,
    deleteComment: removeComment,
  };
}

export default usePostDetail;
