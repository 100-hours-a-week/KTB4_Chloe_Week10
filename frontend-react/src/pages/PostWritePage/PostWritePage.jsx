import { useNavigate } from 'react-router-dom';
import PostForm from '../../components/PostForm/PostForm';
import request from '../../api/request';

async function writePost(formData) {
  return request('/posts', 'POST', formData);
}

function PostWritePage() {
  const navigate = useNavigate();

  async function handleSubmit(values) {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('content', values.content);
    if (values.image) {
      formData.append('postImage', values.image);
    }

    try {
      const response = await writePost(formData);
      navigate(`/posts/${response.data.post_id}`);
    } catch (error) {
      console.error(error);
    }
  }

  return <PostForm mode="create" onSubmit={handleSubmit} />;
}

export default PostWritePage;
