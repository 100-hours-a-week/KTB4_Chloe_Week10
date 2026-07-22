import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PostForm from '../../components/PostForm/PostForm';
import request from '../../api/request';

// 원본: Page/Post_edit/post_edit.js
// 기존값 가져오는..
async function getPostForEdit(postId) {
  return request(`/posts/${postId}/edit`, 'GET');
}

async function editPost(postId, formData) {
  return request(`/posts/${postId}`, 'PUT', formData);
}

function PostEditPage() {
  // URL 경로에서 postId 가져옴
  const { postId } = useParams();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState(null);
  const [error, setError] = useState(false);

  // initialValues가 준비되기 전엔 PostForm을 렌더링하지 않음
  // PostForm의 useState 초기값은 첫 렌더에서 한 번만 평가되므로, 먼저 그려버리면 titleCount가 "0/26"으로 고정되는 원본 버그가 재현됨
  useEffect(() => {
    //cancelled : 이 effect가 이미 정리됐는지 표시하는 로컬 변수
    let cancelled = false;

    // async 방식은 useEfect의 함수 안에서 async 함수를 다시 정의해서 호출하면 됨(usePostDetail의 load()와 동일 패턴)

    // request.js가 상태코드별 콘솔 로그/알림은 대신 해주지만, throw는 그대로 올라오기 때문에
    // 여기서 catch를 안 하면 unhandled rejection이 되고 initialValues도 계속 null이라
    // "불러오는 중입니다" 화면에서 영원히 멈춤 → error state로 받아서 처리
    async function load() {
      try {
        const result = await getPostForEdit(postId);
        // cancelled 가드가 없으면 이전에 요청한 응답에 대한 데이터로 덮어씌어질 수 있다.
        if (!cancelled) setInitialValues(result.data);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError(true);
        }
      }
    }

    load();

    //cleanUp 함수
    return () => {
      cancelled = true;
    };
  }, [postId]);
  // cancelled를 두면서 postId가 바뀌는 매 순간 마다 이전 요청 결과를 무효화

  async function handleSubmit(values) {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('content', values.content);
    // 원본: postImageInput.files.length > 0일 때만 append — 새 파일 안 고르면 기존 이미지 유지
    // removeImage는 "삭제" 버튼을 눌렀을 때만 true — 새 파일도 없고 삭제도 안 눌렀으면 아무것도 안 보내서
    // 서버가 기존 이미지를 그대로 유지하게 함(버그 수정: 기존엔 이미지를 아예 빼는 경우가 없었음)
    if (values.image) {
      formData.append('postImage', values.image);
    } else if (values.removeImage) {
      formData.append('removeImage', 'true');
    }

    try {
      await editPost(postId, formData);
      // 원본: ../Post_detail/post_detail.html?postId= 하드 리다이렉트 → 라우트 경로로 변환
      navigate(`/posts/${postId}`);
    } catch (error) {
      console.error(error);
    }
  }

  if (error) {
    return <p>게시글 정보를 불러오지 못했습니다.</p>;
  }

  if (!initialValues) {
    return <p>게시글 정보를 불러오는 중입니다.</p>;
  }

  return <PostForm mode="edit" initialValues={initialValues} onSubmit={handleSubmit} />;
}

export default PostEditPage;
