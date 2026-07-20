// frontend/Page/Board/board.js:95-113, frontend/Page/Post_detail/post_detail.js:91-109에
// 완전히 동일하게 중복되어 있던 두 함수를 그대로 옮김

// 1,000 이상이면 1k, 10,000 이상이면 10k, 100,000 이상이면 100k 식으로 표기
export function formatCount(count) {
  if (count >= 1000) {
    return `${parseFloat((count / 1000).toFixed(1))}k`;
  }
  return `${count}`;
}

// yyyy-mm-dd hh:mm:ss 형식으로 변환
export function formatDateTime(dateInput) {
  const date = new Date(dateInput);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}
