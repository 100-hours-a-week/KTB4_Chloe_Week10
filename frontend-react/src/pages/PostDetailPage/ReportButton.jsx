import './ReportButton.css';

// 원본: post_detail.html:110
function ReportButton({ onReport }) {
  return (
    <button type="button" className="btn-report-inline" onClick={onReport}>
      신고
    </button>
  );
}

export default ReportButton;
