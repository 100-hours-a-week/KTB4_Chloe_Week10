import { useEffect, useState } from 'react';
import request from '../api/request';

// 원본: frontend/Page/Post_detail/post_detail.js
// 이번 단계 범위: 게시글 표시 + 삭제 + 좋아요 + 신고(5개 API)만. 댓글 API/상태(createComment/editComment/
// deleteComment, comments 배열)는 다음 단계에서 이 훅에 추가 예정 — 지금은 손대지 않음.

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

function usePostDetail(postId) {
  const [post, setPost] = useState(null); // isOwner 포함 — 서버가 계산해서 내려주는 그대로 보관
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  
  const [isLoading, setIsLoading] = useState(true); //로딩중인지
  const [error, setError] = useState(false); //에러났는지

  useEffect(() => {
    let cancelled = false;

    //여기서는 async 방식 사용 
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

  return {
    post,
    isLiked,
    likeCount,
    commentCount,
    isLoading,
    error,
    deletePost: () => deletePost(postId),
    toggleLike,
    reportPost: () => reportPost(postId),
  };
}

export default usePostDetail;
