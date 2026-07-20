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

// Signup.js:147-158, profile_edit.js:129-141에 복붙되어 있던 닉네임 검증(길이>10 → 공백 → 빈값 순서까지 동일).
// 메시지 1곳만 실제로 달랐음: Signup은 "낙네임을 입력해주세요"(오타, 마침표 없음),
// profile_edit은 "닉네임을 입력해주세요."(정상 표기) — 오타가 있는 쪽이 아니라 profile_edit 쪽 문구를 채택.
export function getNicknameError(nickname) {
  if (nickname.length > 10) return '닉네임은 최대 10자 까지 작성 가능합니다.';
  if (/\s/.test(nickname)) return '띄어쓰기를 없애주세요.';
  if (!nickname) return '닉네임을 입력해주세요.';
  return '';
}
