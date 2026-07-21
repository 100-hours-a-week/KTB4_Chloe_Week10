import { useNavigate } from 'react-router-dom';
import PostForm from '../../components/PostForm/PostForm';
import request from '../../api/request';

// 원본: Page/Post_write/post_write.js — FormData 조립 + API 호출 + 성공 후 이동 담당(입력/검증은 PostForm 소관)
async function writePost(formData) {
  return request('/posts', 'POST', formData);
}

function PostWritePage() {
  const navigate = useNavigate();

  async function handleSubmit(values) {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('content', values.content);
    // 원본: postImageInput.files.length > 0일 때만 append — 파일 미선택 시 필드 자체를 안 보냄
    // 받아온 values에 image가 있으면 formData에 추가
    if (values.image) {
      formData.append('postImage', values.image);
    }

    try {
      const response = await writePost(formData);
      // 원본은 response.data.link로 하드 리다이렉트했으나, SPA 전환 후엔 응답의 post_id로
      // 새 게시글 상세 라우트로 바로 이동(board.js/PostCard와 동일하게 post_id 필드 사용)
      navigate(`/posts/${response.data.post_id}`);
    } catch (error) {
      console.error(error);
    }
  }

  return <PostForm mode="create" onSubmit={handleSubmit} />;
}

export default PostWritePage;
