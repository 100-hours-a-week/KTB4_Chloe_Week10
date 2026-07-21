// 원본: frontend/Page/Board/board.js:117-121 (ICONS) — 좋아요/댓글/조회수 아이콘.
// board.js에서 이미 like/comment/view 3개가 카드 하나당 1번씩 재사용되고(게시글 수만큼 반복),
// Post_detail 페이지(post_detail.html)에서도 like/view 아이콘이 동일하게 재사용되어 컴포넌트로 분리.
// className 등 남은 props는 <svg>에 그대로 전달 — PostCard가 className="stat-icon"으로 크기를 제어.

export function LikeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 20.5s-7.5-4.6-10-9.3C.5 8 2 4.5 5.5 4c2-.3 3.8.7 4.9 2.2l1.6 2.1 1.6-2.1C14.7 4.7 16.5 3.7 18.5 4 22 4.5 23.5 8 22 11.2c-2.5 4.7-10 9.3-10 9.3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CommentIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M4 4h16v12H8.5L4 20V4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ViewIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
