// frontend/Page/{Signup,Login,Password_edit}/*.js에 각각 복붙되어 있던 정규식을 그대로 옮김
// (Signup.js:72, Login.js:19 / Signup.js:89,118, Login.js:35, password_edit.js:33,65 — 모두 동일한 리터럴)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/'])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/']{8,20}$/;

export function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

export function isValidPassword(password) {
  return PASSWORD_REGEX.test(password);
}
