import request from "../../API/request.js";

const profileMenuBtn = document.getElementById('profileMenuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('passwordConfirm');

const helperTextPassword = document.getElementById('passwordHelper');
const helperTextConfirmPassword = document.getElementById('passwordConfirmHelper');

const editPasswordBtn = document.getElementById('submitBtn');
const editSuccessToast = document.getElementById('toast');

const LogoutBtn = document.getElementById('logoutBtn');

LogoutBtn.addEventListener('click', function() {
  localStorage.removeItem('accessToken');
  window.location.href = '../Login/Login.html';
});

let isValidPassword = false;
let isValidConfirmPassword = false;

profileMenuBtn.addEventListener('click', function() {
  dropdownMenu.classList.toggle('active');
});


passwordInput.addEventListener('blur', function() {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/'])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/']{8,20}$/;


if (!passwordRegex.test(password)) {
  helperTextPassword.classList.add('error');
  helperTextPassword.textContent = '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
  isValidPassword = false;
} else {
  helperTextPassword.classList.remove('error');
  helperTextPassword.textContent = '';
  isValidPassword = true;
}

// 확인란에 값이 있을 때만 일치 검사
if (confirmPassword) {
  if (password !== confirmPassword) {
    helperTextConfirmPassword.classList.add('error');
    helperTextConfirmPassword.textContent = '비밀번호가 일치하지 않습니다.';
    isValidConfirmPassword = false;
  } else {
    helperTextConfirmPassword.classList.remove('error');
    helperTextConfirmPassword.textContent = '';
    isValidConfirmPassword = true;
  }
}

  activeEditButton();
});

confirmPasswordInput.addEventListener('blur', function() {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/'])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/']{8,20}$/;

  if (!passwordRegex.test(confirmPassword)) {
    helperTextConfirmPassword.classList.add('error');
    helperTextConfirmPassword.textContent = '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
    isValidConfirmPassword = false;
  } else if (confirmPassword !== password) {
    helperTextConfirmPassword.classList.add('error');
    helperTextConfirmPassword.textContent = '비밀번호가 일치하지 않습니다.';
    isValidConfirmPassword = false;
  } else {
    helperTextConfirmPassword.classList.remove('error');
    helperTextConfirmPassword.textContent = '';
    isValidConfirmPassword = true;
  }
  activeEditButton();
});

function activeEditButton() {
  if (isValidPassword && isValidConfirmPassword) {
    editPasswordBtn.classList.add('active');
    editPasswordBtn.disabled = false;
  } else {
    editPasswordBtn.classList.remove('active');
    editPasswordBtn.disabled = true;
  }
}

async function passwordEdit(update_password){
  return await request(`/users/password`,'PATCH',update_password)
}

function showToast() {
  editSuccessToast.classList.add('show');

  setTimeout(() => {
    editSuccessToast.classList.remove('show');
  }, 2000); 
}

editPasswordBtn.addEventListener('click', async function(){
  console.log("클릭")
  const password = {
    password : passwordInput.value
  }

  try {
    await passwordEdit(password);
    showToast();
    passwordInput.value="";
    confirmPasswordInput.value="";

  } catch (error) {
    console.error(error);
  }
})


