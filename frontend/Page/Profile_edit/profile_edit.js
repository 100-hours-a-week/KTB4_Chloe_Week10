import request from "../../API/request.js";

const profileMenuBtn = document.getElementById('profileMenuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

const email = document.getElementById('email');
const headerProfileIcon = document.getElementById('headerProfileIcon');

const profilePreview = document.getElementById('profileImgPreview');
const profileInput = document.getElementById('profileImgInput');

const nicknameInput = document.getElementById('nickname');
const helperTextNickname = document.getElementById('nicknameHelper');
const helperTextProfile = document.getElementById('profileHelper');

const submitBtn = document.getElementById('submitBtn');

const withdrawmodal = document.querySelector('.withdraw_modal');
const withdrawBtn = document.getElementById('withdrawBtn');
const withdrawCancelBtn = document.getElementById('withdrawCancel');
const withdrawConfirmBtn = document.getElementById('withdrawConfirm');

const LogoutBtn = document.getElementById('logoutBtn');

const editSuccessToast = document.getElementById('toast');

let isValidNickname = false;
let isValidProfile = false;

profileMenuBtn.addEventListener('click', function() {
  dropdownMenu.classList.toggle('active');
});

//프로필 사진 
profileInput.addEventListener('change', function () {
  const file = profileInput.files[0];

  if (!file) {
    helperTextProfile.classList.add('error');
    helperTextProfile.textContent = '프로필 사진을 추가해주세요.';
    profilePreview.src = '';
    profilePreview.style.display = 'none';
    isValidProfile = false;
    return;
  }

  const imageSrc = URL.createObjectURL(file);
  
  profilePreview.src = imageSrc;
  profilePreview.style.display = 'block';

  helperTextProfile.classList.remove('error');
  helperTextProfile.textContent = '';

  isValidProfile = true;

});

LogoutBtn.addEventListener('click', function() {
  localStorage.removeItem('accessToken');
  window.location.href = '../Login/Login.html';
});


//회원 탈퇴 -> 모달창 띄우기
withdrawBtn.addEventListener('click', function() {
  withdrawmodal.classList.add('active');
});

withdrawCancelBtn.addEventListener('click', function() {
  withdrawmodal.classList.remove('active');
});

//회원 정보 조회 API
async function getUser() {
  return await request('/users','GET');
}
//회원 정보 조회
document.addEventListener('DOMContentLoaded', async function () {
  const result = await getUser();

  email.textContent = result.data.email;
  nicknameInput.value = result.data.nickname;

  if (result.data.profileImage) {
    //profilePreview.src = `http://localhost:8080${result.data.profileImage}`;
    //headerProfileIcon.src = `http://localhost:8080${result.data.profileImage}`;
    profilePreview.style.display = 'block';
  } else {
    profilePreview.src = '';
    //headerProfileIcon.src = '';
    profilePreview.style.display = 'none';
  }
});

//회원 탈퇴 API 
async function withdrawUser(){
  return await request('/users','DELETE');
}
//회원 탈퇴 
withdrawConfirmBtn.addEventListener('click',async function(){
  try {
     const response = await withdrawUser();
      window.location.href = response.data.link;
    } catch (error) {
      console.error(error);
    }
});

//회원 정보 수정 API
async function updateUser(update_User){
  return await request('/users','PATCH',update_User)
}

function showToast() {
  editSuccessToast.classList.add('show');

  setTimeout(() => {
    editSuccessToast.classList.remove('show');
  }, 2000); 
}

submitBtn.addEventListener('click', async function() {

  const formData = new FormData();
  const nickname = nicknameInput.value;

  if (nickname.length > 10) {
    helperTextNickname.classList.add('error');
    helperTextNickname.textContent = '닉네임은 최대 10자 까지 작성 가능합니다.';
    isValidNickname = false;
  } else if (/\s/.test(nickname)) {
    helperTextNickname.classList.add("error");
    helperTextNickname.textContent = "띄어쓰기를 없애주세요.";
    isValidNickname = false;
  } else if (!nickname) {
    helperTextNickname.classList.add("error");
    helperTextNickname.textContent = "닉네임을 입력해주세요.";
    isValidNickname = false;
  } 

  if (!isValidProfile) {
    helperTextProfile.classList.add('error');
    helperTextProfile.textContent = '프로필 사진을 추가해주세요.';
    profilePreview.src = '';
    profilePreview.style.display = 'none';
  }

  if (!isValidNickname || !isValidProfile) {
    return;
  }

  formData.append("nickname",nicknameInput.value);

  if (profileInput.files.length > 0) {
    formData.append("profileImage", profileInput.files[0]);
  }

  
  try {
  const response = await updateUser(formData);

  if (response === null) return;

  nicknameInput.value = response.data.nickname;

  if (response.data.profileImage) {
    //profilePreview.src = `http://localhost:8080${response.data.profileImage}`;
    profilePreview.style.display = 'block';

    //headerProfileIcon.src = `http://localhost:8080${response.data.profileImage}`;
  }
  else {
    profilePreview.src = '';
    //headerProfileIcon.src = '';
    profilePreview.style.display = 'none';
  }

  showToast();

} catch (error) {
    
    if (error.status === 409) {
        if (error.field === 'nickname') {
          helperTextNickname.classList.add('error');
          helperTextNickname.textContent = "중복된 닉네임 입니다.";
          isValidNickname = false;
        }

    } else {
        console.error(error);
    }

}

});



