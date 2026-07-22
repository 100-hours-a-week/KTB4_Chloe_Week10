import { Link } from 'react-router-dom';
import { LikeIcon, CommentIcon, ViewIcon } from '../icons/StatIcons';
import { getPostImageUrl, getProfileImageUrl } from '../../api/imageRequest';
import { formatCount, formatDateTime } from '../../utils/format';
import './PostCard.css';

function PostCard({ post }) {

  return (
    <li className="post-card">
      <Link to={`/posts/${post.post_id}`}>
        <div className="post-card-inner">
          {post.post_image && (
            <img className="post-img" src={getPostImageUrl(post.post_image)} alt="" />
          )}

          <div className="post-main">
            <h2 className="post-title">{post.title}</h2>

            <div className="meta-stats">
              <span className="stat-item">
                <LikeIcon className="stat-icon" />
                <span>{formatCount(post.like_count)}</span>
              </span>
              <span className="stat-item">
                <CommentIcon className="stat-icon" />
                <span>{formatCount(post.comment_count)}</span>
              </span>
              <span className="stat-item">
                <ViewIcon className="stat-icon" />
                <span>{formatCount(post.view_count)}</span>
              </span>
            </div>

            <div className="post-bottom-row">
              <div className="post-author">
                <div className="author-avatar">
                  {post.profileImage && (
                    <img
                      className="author-avatar-img"
                      src={getProfileImageUrl(post.profileImage)}
                      alt=""
                    />
                  )}
                </div>
                <span className="author-name">{post.writer}</span>
              </div>
              <span className="meta-date">{formatDateTime(post.datewritten)}</span>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}

export default PostCard;
