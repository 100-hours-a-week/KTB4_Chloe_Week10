import request from "../../API/request.js";

const profileMenuBtn = document.getElementById('profileMenuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

const titleInput = document.getElementById('postTitle');
const titleCount = document.getElementById('titleCount');

const postContentInput = document.getElementById('postContent');

const postImageInput = document.getElementById('postImage');
const fileNameDisplay = document.getElementById('fileName');

const writeCompleteBtn = document.getElementById('submitBtn');

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
  activeWriteCompleteButton();
});

postContentInput.addEventListener('input', () => {
    activeWriteCompleteButton();
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

function activeWriteCompleteButton() {

  const isValidTitle = titleInput.value !== '';
  const isValidContent = postContentInput.value !== '';
  
  if (isValidTitle && isValidContent) {
    writeCompleteBtn.classList.add('active');
    writeCompleteBtn.disabled = false;
  } else {
    writeCompleteBtn.classList.remove('active');
    writeCompleteBtn.disabled = true;
  }
}


async function writePost(Post_data){
  return await request(`/posts`,'POST',Post_data);
}


writeCompleteBtn.addEventListener('click',async function(){
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
    const response = await writePost(formData);
    window.location.href = response.data.link;

    if(response === null) return;
  }
  catch(error){
    console.error(error);
  }
})