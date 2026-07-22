import './ReportButton.css';

function ReportButton({ onReport }) {
  return (
    <button type="button" className="btn-report-inline" onClick={onReport}>
      신고
    </button>
  );
}

export default ReportButton;
