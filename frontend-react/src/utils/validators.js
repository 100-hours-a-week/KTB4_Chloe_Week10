const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/'])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/']{8,20}$/;

export function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

export function isValidPassword(password) {
  return PASSWORD_REGEX.test(password);
}

export function getNicknameError(nickname) {
  if (nickname.length > 10) return '닉네임은 최대 10자 까지 작성 가능합니다.';
  if (/\s/.test(nickname)) return '띄어쓰기를 없애주세요.';
  if (!nickname) return '닉네임을 입력해주세요.';
  return '';
}
