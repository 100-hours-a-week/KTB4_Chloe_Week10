import request from "../../API/request.js";
import { getPostImageUrl } from "../../API/imageRequest.js";
import { getProfileImageUrl } from "../../API/imageRequest.js";

import createElement from "./vdom/createElement.js";
import { patch } from "./vdom/patch.js";
import { diff } from "./vdom/diff.js";
import render from "./vdom/render.js"

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

let commentList = document.getElementById('commentList');
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

// state — 댓글 배열을 명시적으로 관리
// 기존에는 그냥 게시글 상세조회할 때 받아온 데이터를 한번 댓글 목록 그리는데 쓰고 말았는데,
// VDOM 방식에서는 비교를 위해서 이전 값을 알아야 하기 때문에 
// comments는 게시글 상세조회할 때 댓글 받아온 배열 넣어주거나, 댓글 추가할 때 배열의 앞단에 넣거나, 댓글 삭제 할 때 배열에서 삭제해서 업데이트 되는 형식!
let comments = [];

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

  // 이전 방식
  // result.data.comments.forEach((comment) => {
  //   commentList.appendChild(createCommentElement(comment));
  // });

  comments = result.data.comments;  // 배열  자체를 state에 담기
  mountComments();                  // 최초 호출

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

let currentEditCommentId = null;
let currentEditCommentBody = null;

let currentDeleteCommentId = null;
let currentDeleteItem = null;

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

  return createElement('li', { className: 'comment-item', key: comment.commentId }, // ← key 필수!
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

function mountComments() {
  // 1. 현재 comments 배열로 최상위 ul Vnode 생성
  const ulVnode = createElement('ul', { className: 'comment-list', id: 'commentList' },
    ...comments.map(comment => createCommentVNode(comment))
  );

  // 2. Vnode를 진짜 DOM으로 변환
  const newUlDom = render(ulVnode);

  // 3. 기존 <ul id="commentList">를 새로 만든 DOM으로 통째로 교체 (딱 1번만 일어남)
  commentList.replaceWith(newUlDom);

  // 4. 이후 diff/patch를 위한 기준값 저장
  newUlDom._prevVnode = ulVnode;
  newUlDom._domNode = newUlDom;

  // 5. commentList 참조를 새 DOM으로 갱신 (이후 모든 코드가 이걸 기준으로 동작해야 하니까)
  commentList = newUlDom;

  //이벤트 등록
  commentList.addEventListener('click', async function (e) {
    const editBtn = e.target.closest('.btn-edit-comment');
    const deleteBtn = e.target.closest('.btn-delete-comment');

    if (editBtn) {
      const commentBody = editBtn.closest('.comment-item').querySelector('.comment-body');

      commentInput.value = commentBody.textContent;
      commentSubmitBtn.textContent = '댓글 수정';
      commentSubmitBtn.classList.add('active');
      commentSubmitBtn.disabled = false;
      isEditing = true;

      currentEditCommentId = editBtn.dataset.commentId;
      currentEditCommentBody = editBtn.closest('.comment-item').querySelector('.comment-body');
    }

    if (deleteBtn) {
      currentDeleteCommentId = deleteBtn.dataset.commentId;
      commentDeleteModal.classList.add('active');
      document.body.classList.add('modal-open');
      currentDeleteItem = deleteBtn.closest('.comment-item');
    }
  });
}


function rerenderComments() {
  // 현재 comments 배열로 새 ul VNode 생성 (mountComments와 똑같은 방식)
  const newUlVnode = createElement('ul', { className: 'comment-list', id: 'commentList' },
    ...comments.map(comment => createCommentVNode(comment))
  );

  // ul 전체(하나의 VNode)를 diff — 최상위부터 시작
  const patches = diff(commentList._prevVnode, newUlVnode);

  // ul 전체를 대상으로 patch 적용 — patch() 내부에서 필요하면 알아서 patchChildren 호출함
  patch(commentList._domNode, patches);

  // 다음 비교를 위해 기준값 갱신
  commentList._prevVnode = newUlVnode;
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




commentDeleteConfirmBtn.addEventListener('click', async function () {
  const result = await deleteComment(currentDeleteCommentId);
      
  // 이전 방식
  // currentDeleteItem.remove();

  // 배열에서 해당 댓글만 제외하고 새 배열 만들기
  // filter는 배열을 순회하면서, 조건이 true인 것들만 골라서 새 배열을 만드는 메서드
  // currentDeleteCommentId = deleteBtn.dataset.commentId 이렇게 dataset으로 불러오면 문자열이 불러와지기 때문에 
  // 타입을 맞추기 위해서 Number을 사용
  comments = comments.filter(comment => comment.commentId !== Number(currentDeleteCommentId));
  rerenderComments();

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
      console.log('editComment 응답:', result.data); // 여기 찍어보기
      // 이전 방식
      // currentEditCommentBody.textContent = result.data.commentContent; 

      // DOM 직접 수정 대신, 배열 갱신 + renderComments()
      // currentEditCommentId 와 돌고 있는 comment의 id가 같으면, 그 댓글 본문을 서버에서 받아온 데이터로 변경
      comments = comments.map(comment =>
         comment.commentId === Number(currentEditCommentId)
           ? { ...comment, commentContent: result.data.commentContent }
           : comment //현재 수정 중인 댓글 ID가 아니면 그냥 comment를 새로운 배열 
       );

       rerenderComments();

      isEditing = false;
      currentEditCommentId = null;
      commentSubmitBtn.textContent = '댓글 등록';
    } else {
      const result = await createComment(comment_data);
      //이전 방식
      //commentList.prepend(createCommentElement(result.data));

      comments = [result.data, ...comments];  // 새 댓글을 맨 앞에 추가 (prepend 대응)
      rerenderComments();;                        // 두 번째 이후 호출 → else 블록 분기로 들어감 (diff,patch)

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
