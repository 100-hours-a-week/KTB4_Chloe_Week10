import { memo } from 'react';
import { getPostImageUrl, getProfileImageUrl } from '../../../api/imageRequest';
import { formatDateTime } from '../../../utils/format';
import './PostHeader.css';

function PostHeader({ post }) {
  return (
    <>
      <h2 className="post-title">{post.title}</h2>

      <div className="post-author-row">
        <div className="author-avatar">
          {post.profileImage && (
            <img className="author-avatar-img" src={getProfileImageUrl(post.profileImage)} alt="" />
          )}
        </div>
        <span className="author-name">{post.writer}</span>
        <span className="post-date">{formatDateTime(post.datewritten)}</span>
      </div>

      {post.post_image && (
        <div className="post-image-wrap">
          <img className="post-image-placeholder" src={getPostImageUrl(post.post_image)} alt="게시글 이미지" />
        </div>
      )}

      <div className="post-body">
        <p>{post.content}</p>
      </div>
    </>
  );
}

export default memo(PostHeader);
