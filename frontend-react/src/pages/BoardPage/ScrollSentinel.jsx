import './ScrollSentinel.css';

function ScrollSentinel({ sentinelRef }) {
  return <div className="scrolerFooter" ref={sentinelRef} />;
}

export default ScrollSentinel;
