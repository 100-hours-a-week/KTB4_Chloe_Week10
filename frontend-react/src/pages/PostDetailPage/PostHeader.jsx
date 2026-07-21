import { getPostImageUrl, getProfileImageUrl } from '../../api/imageRequest';
import { formatDateTime } from '../../utils/format';
import './PostHeader.css';

// 원본: post_detail.html:85-102 / post_detail.js:133-150
// 원본은 postBody.textContent를 <div class="post-body">에 직접 대입하는데, CSS는 .post-body p를
// 스타일링하고 있어 실제로는 적용된 적 없는 죽은 규칙이었음 — <p>로 감싸서 의도대로 스타일 적용되게 함
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

export default PostHeader;
