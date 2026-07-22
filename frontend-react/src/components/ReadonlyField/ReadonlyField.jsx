import './ReadonlyField.css';

// 원본: Page/Profile_edit/profile_edit.html:50-54 <p class="email-text">
// ValidatedField와 같은 .form-group/.form-label 레이아웃을 쓰되, 입력 불가 — 값만 표시하는 완전 무상태 컴포넌트.
function ReadonlyField({ id, label, value }) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <p className="readonly-text" id={id}>
        {value}
      </p>
    </div>
  );
}

export default ReadonlyField;
