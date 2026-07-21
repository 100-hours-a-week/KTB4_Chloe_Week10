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

  // initialValues가 준비되기 전엔 PostForm을 렌더링하지 않음 
  // PostForm의 useState 초기값은 첫 렌더에서 한 번만 평가되므로, 먼저 그려버리면 titleCount가 "0/26"으로 고정되는 원본 버그가 재현됨
  useEffect(() => {
    //cancelled : 이 effect가 이미 정리됐는지 표시하는 로컬 변수
    let cancelled = false;

    // getPostForEdit에 대한 요청이 끝나면 then안에 있는 함수 실행
    // async 방식은 useEfect의 함수 안에서 async 함수를 다시 정의해서 호출하면 됨
    getPostForEdit(postId).then((result) => {
      // cancelled 가드가 없으면 이전에 요청한 응답에 대한 데이터로 덮어씌어질 수 있다.
      if (!cancelled) setInitialValues(result.data);
    });

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
    if (values.image) {
      formData.append('postImage', values.image);
    }

    try {
      await editPost(postId, formData);
      // 원본: ../Post_detail/post_detail.html?postId= 하드 리다이렉트 → 라우트 경로로 변환
      navigate(`/posts/${postId}`);
    } catch (error) {
      console.error(error);
    }
  }

  if (!initialValues) {
    return <p>게시글 정보를 불러오는 중입니다.</p>;
  }

  return <PostForm mode="edit" initialValues={initialValues} onSubmit={handleSubmit} />;
}

export default PostEditPage;
