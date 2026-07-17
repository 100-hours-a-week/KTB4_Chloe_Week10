import request from "../../API/request.js";

const profileMenuBtn = document.getElementById('profileMenuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

const titleInput = document.getElementById('postTitle');
const titleCount = document.getElementById('titleCount');

const postContentInput = document.getElementById('postContent');

const postImageInput = document.getElementById('postImage');
const fileNameDisplay = document.getElementById('fileName');

const editCompleteBtn = document.getElementById('submitBtn');

const LogoutBtn = document.getElementById('logoutBtn');

LogoutBtn.addEventListener('click', function() {
  localStorage.removeItem('accessToken');
  window.location.href = '../Login/Login.html';
});

profileMenuBtn.addEventListener('click', function() {
  dropdownMenu.classList.toggle('active');
});


titleInput.addEventListener('input', () => {

  titleCount.textContent = `${titleInput.value.length}/26`;
  activeEditCompleteButton();
});

postContentInput.addEventListener('input', () => {
    activeEditCompleteButton();
});

postImageInput.addEventListener('change', () => {
  const file = postImageInput.files[0];
  if (file) {
    fileNameDisplay.textContent = file.name;
  } else {
    fileNameDisplay.textContent = '파일을 선택해주세요.';
  }

  const fileSrc = URL.createObjectURL(file);
});

function activeEditCompleteButton() {
  const isValidTitle = titleInput.value !== '';
  const isValidContent = postContentInput.value !== '';

  if (isValidTitle && isValidContent) {
    editCompleteBtn.classList.add('active');
    editCompleteBtn.disabled = false;
  } else {
    editCompleteBtn.classList.remove('active');
    editCompleteBtn.disabled = true;
  }
} 

const params = new URLSearchParams(document.location.search);
const postId = params.get('postId');

//게시글 수정 페이지 기본값 API 연동
async function defaultEditPage(){
  return await request(`/posts/${postId}/edit`,'GET')
}

//지금 이미지 
let existingPostImage = null;

document.addEventListener('DOMContentLoaded', async function(){
    const response = await defaultEditPage();
    console.log(response)
    titleInput.value = response.data.title;
    postContentInput.textContent = response.data.content;
    
    existingPostImage = response.data.postImage;
    fileNameDisplay.textContent = response.data.postImage;

})


//게시글 수정 API 연동
async function editPost(Post_data) {
  return await request(`/posts/${postId}`,'PUT',Post_data)
}


editCompleteBtn.addEventListener('click',async function(){
  const formData = new FormData();

  const title = titleInput.value;
  const content = postContentInput.value;

  if (!title || !content) {
    alert('제목과 내용을 모두 입력해주세요.');
    return;
  }
  
  formData.append("title", title);
  formData.append("content", content);
  if (postImageInput.files.length > 0) {
    formData.append("postImage", postImageInput.files[0]);
  }

  try{
    const response = await editPost(formData);
    window.location.href = `../Post_detail/post_detail.html?postId=${postId}`;

    if(response === null) return;
  }
  catch(error){
    console.error(error);
  }
})