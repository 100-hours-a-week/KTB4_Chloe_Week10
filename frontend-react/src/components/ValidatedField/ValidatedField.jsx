import './ValidatedField.css';

// 원본 마크업 대응: frontend/Page/Login/Login.html, Signup.html, Password_edit/password_edit.html의
// <div class="form-group"><label class="form-label">...<input class="form-input">...<p class="helper-text">
//
// 순수 표시 컴포넌트 — 자체 상태 없음. 에러 판단은 하지 않고 상위 Form이
// validators.js(isValidEmail/isValidPassword)로 계산한 error 문자열을 그대로 받아 보여주기만 한다.
// onChange/onBlur도 상위 Form이 정의(blur에서 검증할지 input에서 검증할지는 호출부 책임 — Login은
// input, Signup/Password_edit은 blur를 쓰는 등 페이지마다 다르므로 이 컴포넌트가 강제하지 않는다).

// 입력창 모양 담당
// 부모 컴포넌트가 필요한 값 모두 넘겨주고 있음 
function ValidatedField({
  id,
  label,
  type = 'text',
  value,
  error,
  onChange,
  onBlur,
  placeholder,
  required = false,
  autoComplete,
  maxLength,
}) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
        {/* required가 true  → * 표시 & required가 false → 아무것도 표시하지 않음 */}
        {required && <span className="required">*</span>}
      </label>
      {/* 실제 입력값은 ValidatedField 내부가 아니라 부모 컴포넌트가 가지고 있음 */}
      <input
        className="form-input"
        type={type}
        id={id}
        name={id}
        value={value}
        
        // 사용자가 입력창에 글자를 입력하면 브라우저가 이벤트 객체 e를 전달
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
      />
      <p className={`helper-text${error ? ' error' : ''}`}>{error}</p>
    </div>
  );
}

export default ValidatedField;
