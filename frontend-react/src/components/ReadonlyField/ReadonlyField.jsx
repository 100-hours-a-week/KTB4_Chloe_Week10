import './ReadonlyField.css';

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
