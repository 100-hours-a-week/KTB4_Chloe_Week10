import './ValidatedField.css';

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
  multiline = false,
  showCharCount = false,
}) {
  const Field = multiline ? 'textarea' : 'input';

  return (
    <div className="form-group">
      <label className={`form-label${showCharCount ? ' form-label--with-count' : ''}`} htmlFor={id}>
        {label}
        {required && <span className="required">*</span>}
        {showCharCount && (
          <span className="text-count">
            {value.length}/{maxLength}
          </span>
        )}
      </label>
      <Field
        className={multiline ? 'form-textarea' : 'form-input'}
        type={multiline ? undefined : type}
        id={id}
        name={id}
        value={value}

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
