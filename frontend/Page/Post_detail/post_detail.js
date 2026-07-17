import request from "../../API/request.js";
import { getPostImageUrl } from "../../API/imageRequest.js";
import { getProfileImageUrl } from "../../API/imageRequest.js";

import createElement from "./vdom/createElement.js";

const profileMenuBtn = document.getElementById('profileMenuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

const postTitle = document.querySelector('.post-title');
const authorAvatar = document.querySelector('.author-avatar');
const authorName = document.querySelector('.author-name');
const postDate = document.querySelector('.post-date');
const postImagePlaceholder = document.querySelector('.post-image-placeholder');
const postBody = document.querySelector('.post-body');

const viewCount = document.getElementById('viewCountNum');

const postEditBtn = document.getElementById('postEditBtn');

const postDeleteModal = document.querySelector('.post_delete_modal');
const postDeleteBtn = document.getElementById('postDeleteBtn');
const postDeleteConfirmBtn = document.getElementById('postDeleteConfirm');
const postDeleteCancelBtn = document.getElementById('postDeleteCancel');

const commentDeleteModal = document.querySelector('.comment_delete_modal');
const commentDeleteBtn = document.querySelector('.btn-action.btn-delete-comment');
const commentDeleteConfirmBtn = document.getElementById('commentDeleteConfirm');
const commentDeleteCancelBtn = document.getElementById('commentDeleteCancel');

const likeBtn = document.getElementById('likeBtn');
const likeCount = document.getElementById('likeCount');

const commentList = document.getElementById('commentList');
const commentInput = document.getElementById('commentTextarea');
const commentSubmitBtn = document.getElementById('commentSubmitBtn');

const commentEditBtn = document.querySelector('.btn-action.btn-edit-comment');
const commentContent = document.querySelector('.comment-body');

const postReportBtn = document.getElementById('postReportBtn');

const LogoutBtn = document.getElementById('logoutBtn');

const commentCountHeading = document.getElementById('commentCountHeading');


LogoutBtn.addEventListener('click', function() {
  localStorage.removeItem('accessToken');
  window.location.href = '../Login/Login.html';
});

let isEditing = false;
let isLiked = false; 


profileMenuBtn.addEventListener('click', function() {
  dropdownMenu.classList.toggle('active');
});


//게시글 삭제 모달 
postDeleteBtn.addEventListener('click', function() {
  postDeleteModal.classList.add('active');
  document.body.classList.add('modal-open');
});

postDeleteCancelBtn.addEventListener('click', function() {
  postDeleteModal.classList.remove('active');
  document.body.classList.remove('modal-open');
});


commentInput.addEventListener('input', function() {
  const commentText = commentInput.value;
  if(commentText){
    commentSubmitBtn.classList.add('active');
    commentSubmitBtn.disabled = false;
  } else {
    commentSubmitBtn.classList.remove('active');
    commentSubmitBtn.disabled = true; 
  }
});



// 1,000 이상이면 1k, 10,000 이상이면 10k, 100,000 이상이면 100k 식으로 표기
function formatCount(count) {
  if (count >= 1000) {
    return `${parseFloat((count / 1000).toFixed(1))}k`;
  }
  return `${count}`;
}


// yyyy-mm-dd hh:mm:ss 형식으로 변환
function formatDateTime(dateInput) {
  const date = new Date(dateInput);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}


const params = new URLSearchParams(document.location.search);
const postId = params.get('postId');


//게시글 상세 조회 API 연동
async function getDetailPost(){
  return await request(`/posts/${postId}`,'GET')
}

document.addEventListener('DOMContentLoaded', async function () {

  const result = await getDetailPost();

  postTitle.textContent = result.data.post.title;
  if (result.data.post.profileImage) {
      const authorAvatarImg = document.createElement('img');
      authorAvatarImg.className = 'author-avatar-img';
      authorAvatarImg.src = getProfileImageUrl(result.data.post.profileImage);
      authorAvatarImg.alt = '';
      authorAvatar.appendChild(authorAvatarImg);
  }
  authorName.textContent = result.data.post.writer;
  postDate.textContent = formatDateTime(result.data.post.datewritten);
  postBody.textContent = result.data.post.content;

  if (result.data.post.post_image) {
    postImagePlaceholder.src = getPostImageUrl(result.data.post.post_image);
    postImagePlaceholder.style.display = 'block';
  } else {
    postImagePlaceholder.style.display = 'none';
  }

  if (!result.data.post.isOwner) {
    postEditBtn.style.display = 'none';
    postDeleteBtn.style.display = 'none';
  }
 
  if(result.data.is_liked){
    isLiked = true;
    likeBtn.classList.add('liked');
  }

  viewCount.textContent = formatCount(result.data.post.view_count);
  likeCount.textContent = formatCount(result.data.post.like_count);
 
  document.getElementById('commentCountHeading').textContent = result.data.post.comment_count;

  result.data.comments.forEach((comment) => {
    commentList.appendChild(createCommentElement(comment));
  });

});
//게시글 수정 페이지 이동
postEditBtn.addEventListener('click', function() {
  window.location.href = `../Post_edit/post_edit.html?postId=${postId}`;
});

//게시글 삭제 API 연동
async function deletePost(){
  return await request(`/posts/${postId}`,'DELETE');
}

postDeleteConfirmBtn.addEventListener('click', async function(){
  try{
   await deletePost();
    window.location.href = "../Board/board.html";
  } catch (error) {
    console.error(error);
  }
});

//댓글 생성 API 연동
async function createComment(comment_data){
    return await request(`/posts/${postId}/comment`,'POST',comment_data);
}

// 댓글 목록 부분 
// 댓글의 Vnode를 만드는 과정 - 직접 만든 createElement 이용해서
function createCommentVNode(comment) {
  // 기존에 프로필 관련 요소에서 프로필 이미지가 존재하면 img태그를 이용해서 commentAvatar.appendChild(authorAvatarImg); 으로 자식으로 넣고 있음
  // 그래서 comment.profileImage 가 존재하면 자식 요소로 avatarChildren만들고, 값이 없으면 그냥 빈 배열
  const avatarChildren = comment.profileImage
    ? [createElement('img', {
        className: 'comment-author-avatar-img',
        src: getProfileImageUrl(comment.profileImage),
        alt: ''
      })]
    : [];

  return 
  createElement('li', { className: 'comment-item', key: comment.commentId }, // ← key 필수!
    createElement('div', { className: 'comment-header' },
      //이 부분은 comment-author-wrap에 기존에 넣었던 것 처럼 프로필 이미지,작성자 이름,날짜를 넣고 있음
      createElement('div', { className: 'comment-author-wrap' },
        createElement('div', { className: 'author-avatar comment-avatar' }, ...avatarChildren),
        createElement('span', { className: 'comment-author' }, comment.commenter),
        createElement('span', { className: 'comment-date' }, formatDateTime(comment.commentDateWritten))
      ),
      //이 부분도 comment-actions 밑에 수정과삭제 버튼 요소를 자식으로 넣고 있음 
      createElement('div', { className: 'comment-actions' },
        createElement('button', {
          className: 'btn-action btn-edit-comment',
          'data-comment-id': comment.commentId
        }, '수정'),
        createElement('button', {
          className: 'btn-action btn-delete-comment',
          'data-comment-id': comment.commentId
        }, '삭제')
      )
    ),
    createElement('p', { className: 'comment-body' }, comment.commentContent)
  );
}


function createCommentElement(comment) {
  const li = document.createElement('li');
  li.className = 'comment-item';

  const commentHeader = document.createElement('div');
  commentHeader.className = 'comment-header';

  const commentAuthorWrap = document.createElement('div');
  commentAuthorWrap.className = 'comment-author-wrap';

  const commentAvatar = document.createElement('div');
  commentAvatar.className = 'author-avatar comment-avatar';
  if (comment.profileImage) {
      const authorAvatarImg = document.createElement('img');
      authorAvatarImg.className = 'comment-author-avatar-img';
      authorAvatarImg.src = getProfileImageUrl(comment.profileImage);
      authorAvatarImg.alt = '';
      commentAvatar.appendChild(authorAvatarImg);
  }

  const commentAuthor = document.createElement('span');
  commentAuthor.className = 'comment-author';
  commentAuthor.textContent = comment.commenter;

  const commentDate = document.createElement('span');
  commentDate.className = 'comment-date';
  commentDate.textContent = formatDateTime(comment.commentDateWritten);

  commentAuthorWrap.appendChild(commentAvatar);
  commentAuthorWrap.appendChild(commentAuthor);
  commentAuthorWrap.appendChild(commentDate);

  const commentActions = document.createElement('div');
  commentActions.className = 'comment-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn-action btn-edit-comment';
  editBtn.textContent = '수정';
  editBtn.dataset.commentId = comment.commentId;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-action btn-delete-comment';
  deleteBtn.textContent = '삭제';
  deleteBtn.dataset.commentId = comment.commentId;

  commentActions.appendChild(editBtn);
  commentActions.appendChild(deleteBtn);

  commentHeader.appendChild(commentAuthorWrap);
  commentHeader.appendChild(commentActions);

  const commentBody = document.createElement('p');
  commentBody.className = 'comment-body';
  commentBody.textContent = comment.commentContent;

  li.appendChild(commentHeader);
  li.appendChild(commentBody);

  return li;
}

//댓글 수정 API 연동
async function editComment(commentId,comment_data){
  return await request(`/posts/${postId}/comment/${commentId}`,'PUT',comment_data)
}

//댓글 삭제 API 연동
async function deleteComment(commentId){
  return await request(`/posts/${postId}/comment/${commentId}`,'DELETE')
} 

//댓글 삭제 모달
commentDeleteCancelBtn.addEventListener('click', function() {
  commentDeleteModal.classList.remove('active'); 
  document.body.classList.remove('modal-open');
}); 


let currentEditCommentId = null;
let currentEditCommentBody = null;

let currentDeleteCommentId = null;
let currentDeleteItem = null;

//각 댓글 당 수정&삭제 버튼 등록..
commentList.addEventListener('click', async function(e) {

  const editBtn = e.target.closest('.btn-edit-comment');
  const deleteBtn = e.target.closest('.btn-delete-comment');

  if (editBtn) {
    const commentId = editBtn.dataset.commentId;
    const commentBody = editBtn.closest('.comment-item').querySelector('.comment-body'); // 댓글 내용

    commentInput.value = commentBody.textContent;
    commentSubmitBtn.textContent = '댓글 수정';
    commentSubmitBtn.classList.add('active');
    commentSubmitBtn.disabled = false;
    isEditing = true;

    currentEditCommentId = editBtn.dataset.commentId;
    currentEditCommentBody = editBtn.closest('.comment-item').querySelector('.comment-body');
  }

  if(deleteBtn) {
    currentDeleteCommentId = deleteBtn.dataset.commentId;
    commentDeleteModal.classList.add('active');
    document.body.classList.add('modal-open');
    currentDeleteItem = deleteBtn.closest('.comment-item');
  }
});
    commentDeleteConfirmBtn.addEventListener('click', async function () {
      const result = await deleteComment(currentDeleteCommentId);
      
      if (currentDeleteItem) {
        currentDeleteItem.remove();
      }
      commentDeleteModal.classList.remove('active');
      document.body.classList.remove('modal-open');
      commentCountHeading.textContent = result.data.commentCount;
});


commentSubmitBtn.addEventListener('click', async function() {
  const comment_data = {
    commentContent: commentInput.value
  }


  try {
    //댓글 수정으로 버튼이 변한 경우
    if (isEditing) {
		   //currentEditCommentId는 해당 댓글의 수정 버튼이 눌리면 값이 들어가짐.
      const result = await editComment(currentEditCommentId, comment_data);
      currentEditCommentBody.textContent = result.data.commentContent; 

      isEditing = false;
      currentEditCommentId = null;
      commentSubmitBtn.textContent = '댓글 등록';
    } else {
      const result = await createComment(comment_data);
      commentList.prepend(createCommentElement(result.data));
      commentCountHeading.textContent = result.data.commentCount;
    }

    commentInput.value = '';
    commentSubmitBtn.classList.remove('active');
    commentSubmitBtn.disabled = true;
  } catch (error) {
    console.error(error);
  }
});


//게시글 좋아요 등록 API 연동
async function likePost(){
  return await request(`/posts/${postId}/like`,'POST')
}

//게시글 좋아요 취소 API 연동
async function unlikePost(){
  return await request(`/posts/${postId}/like`,'DELETE')
}

likeBtn.addEventListener('click', async function() {
  try {
    if(likeBtn.classList.contains('liked') && isLiked) {
      const result = await unlikePost(postId);
      likeBtn.classList.remove('liked');
      likeCount.textContent = formatCount(result.data.like_count);
      isLiked = false;
    } else {
      const result = await likePost(postId);
      likeBtn.classList.add('liked');
      likeCount.textContent = formatCount(result.data.like_count);
      isLiked = true;

    }
  } catch (error) {
    console.error(error);
  }
});


//게시글 신고 API 연동
async function reportPost(){
  return await request(`/posts/${postId}/declaration`,'POST')
} 


postReportBtn.addEventListener('click', async function() {
  try {
    const result = await reportPost();
    alert('게시글 신고가 완료되었습니다.');
    window.location.href = "../Board/board.html";
  } catch (error) {
    console.error(error);
  }
});


const sidebar = document.getElementById('sidebar');
const collapsedTopbar = document.getElementById('collapsedTopbar');
const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
const sidebarExpandBtn = document.getElementById('sidebarExpandBtn');

sidebarCollapseBtn.addEventListener('click', function () {
  sidebar.classList.add('collapsed');
  collapsedTopbar.hidden = false;
});

sidebarExpandBtn.addEventListener('click', function () {
  sidebar.classList.remove('collapsed');
  collapsedTopbar.hidden = true;
});
