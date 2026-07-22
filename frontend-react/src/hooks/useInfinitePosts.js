import { useEffect, useRef, useState } from 'react';
import request from '../api/request';

const LIMIT = 7;

function useInfinitePosts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const sentinelRef = useRef(null);
  const cursorIdRef = useRef(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (!entry.isIntersecting) return;
        if (isLoadingRef.current) return;

        try {
          isLoadingRef.current = true;
          setIsLoading(true);
          setError(false);

          const params = new URLSearchParams({ limit: LIMIT });
          if (cursorIdRef.current !== null) {
            params.set('cursor', cursorIdRef.current);
          }

          const result = await request(`/posts?${params.toString()}`, 'GET');
          const newPosts = result.data;

          if (newPosts.length > 0) {
            setPosts((prev) => [...prev, ...newPosts]);
          }

          if (newPosts.length === LIMIT) {
            cursorIdRef.current = newPosts[newPosts.length - 1].post_id;
          } else {
            observer.unobserve(node);
          }
        } catch (err) {
          console.error(err);
          setError(true);
        } finally {
          isLoadingRef.current = false;
          setIsLoading(false);
        }
      });
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return { posts, isLoading, error, sentinelRef };
}

export default useInfinitePosts;
