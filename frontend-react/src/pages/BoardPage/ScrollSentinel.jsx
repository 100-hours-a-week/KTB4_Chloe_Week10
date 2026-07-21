import './ScrollSentinel.css';

// 원본: board.html:83 <div class="scrolerFooter" id="sentinel">
// IntersectionObserver 자체는 useInfinitePosts 훅이 소유(hooks/useInfinitePosts.js)하고
// sentinelRef를 반환한다 — 이 컴포넌트는 그 ref를 받아 관찰 대상 DOM만 렌더링한다.

// ScrollSentinel이 렌더링되면서 실제 <div> DOM 노드가 생성됨
// React가 그 노드를 sentinelRef.current에 채워줌
// useInfinitePosts의 useEffect가 sentinelRef.current(그 노드)를 읽어서 observer.observe(node) 호출
function ScrollSentinel({ sentinelRef }) {
  return <div className="scrolerFooter" ref={sentinelRef} />;
}

export default ScrollSentinel;
