import { useEffect, useRef, useState } from 'react';
import request from '../api/request';

// 원본: frontend/Page/Board/board.js:33-92
const LIMIT = 7;

// cursorId/isLoading은 useState가 아닌 useRef로 관리.
// 이유: cursorId는 페이지를 불러올 때마다 계속 바뀌는 값인데,
// IntersectionObserver 콜백은 등록 시점의 클로저를 그대로 참조하기 때문에
// useState로 두면 콜백 안에서 stale한(과거) 값을 참조할 위험이 있음.
// (state 갱신은 다음 렌더링에서만 반영되는 반면, ref는 즉시 반영됨)

// 특히 isLoadingRef는 "중복 요청 방지 가드" 용도라 이 문제가 치명적임
// state였다면 연속 intersect 시 stale한 isLoading=false를 보고 중복 요청이 나갈 수 있음.
// -> 원본 vanilla의 모듈 스코프 let 변수와 동일한 성질(즉시 반영, 리렌더 트리거 없음)을 React에서 재현한 것.

// posts/isLoading/error는 반대로 "화면에 그려야 하는 값"이라
// 리렌더링이 필요하므로 useState로 관리.

// 화면용 값은 state, 로직 제어용 값은 ref로 나눔
// isLoading 같은 경우는 IntersectionObserver의 요청을 하냐 마냐의 제어용으로 사용되기도 하고
// 지금 로딩 중인지를 화면에 표시해야하는 화면용 값으로 사용되기도 한다. -> 그래서 ref와 state로 구현 
function useInfinitePosts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const sentinelRef = useRef(null);
  const cursorIdRef = useRef(null); // 처음엔 null — board.js:33
  const isLoadingRef = useRef(false);

  useEffect(() => {
    const node = sentinelRef.current; // 게시글 목록 맨 아래에 두는 감지용 요소
    if (!node) return;

    // board.js:39-66 그대로 — entries.forEach 형태까지 동일하게 유지(관측 대상은 sentinel 하나뿐)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (!entry.isIntersecting) return;
        if (isLoadingRef.current) return;

        try {
          isLoadingRef.current = true;
          setIsLoading(true);
          setError(false);

          // board.js:74-80 — cursor는 있을 때만 파라미터에 포함
          const params = new URLSearchParams({ limit: LIMIT });
          if (cursorIdRef.current !== null) {
            params.set('cursor', cursorIdRef.current);
          }

          const result = await request(`/posts?${params.toString()}`, 'GET');
          const newPosts = result.data;

          if (newPosts.length > 0) {
            setPosts((prev) => [...prev, ...newPosts]);
          }

          // board.js:84-89 — 정확히 LIMIT개일 때만 다음 cursor로 갱신하고 계속 관찰,
          // 아니면(마지막 페이지) 더 이상 요청하지 않도록 관찰 해제
          if (newPosts.length === LIMIT) {
            cursorIdRef.current = newPosts[newPosts.length - 1].post_id;
          } else {
            observer.unobserve(node);
          }
        } catch (err) {
          // board.js:57-59 — 에러 시에도 unobserve하지 않음(다음 intersect 때 자동 재시도)
          console.error(err);
          setError(true);
        } finally {
          // isLoading이 false가 되어야지 다음 요청 가능
          isLoadingRef.current = false;
          setIsLoading(false);
        }
      });
    });

    observer.observe(node);

    // StrictMode는 개발 환경에서 effect의 cleanup이 제대로 작성됐는지 확인하기 위해
    // effect를 실행한 뒤 cleanup하고 다시 실행할 수 있음.
    // cleanup에서 기존 observer를 해제하지 않으면 observer가 중복 등록되어
    // sentinel 감지 시 요청이 여러 번 발생할 수도 있음 

    // 그래서 cleanup에서 반드시 해제해야 관찰자가 중복으로 안 붙음
    // 컴포넌트가 더 이상 사용하지 않는 observer를 제거해서 중복 감시와 메모리 누수를 막음!
    return () => observer.disconnect();
  }, []);

  return { posts, isLoading, error, sentinelRef };
}

export default useInfinitePosts;
