import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for smart internal container auto-scrolling.
 *
 * Rules:
 * 1. Automatically scrolls the INTERNAL CONTAINER ONLY when new dependencies arrive,
 *    BUT ONLY IF the user is currently scrolled near the bottom of that container.
 * 2. If the user has scrolled upward, it does NOT auto-scroll, preserving user scroll position.
 * 3. Tracks unread new messages that arrive while scrolled up.
 * 4. NEVER calls window/document scroll functions.
 */
export function useSmartAutoScroll<T extends HTMLElement>(
  dependency: any,
  bottomThreshold = 60
) {
  const containerRef = useRef<T | null>(null);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const checkIfAtBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom <= bottomThreshold;
    
    setIsAtBottom(nearBottom);
    if (nearBottom) {
      setUnreadCount(0);
    }
  }, [bottomThreshold]);

  const scrollToBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: 'smooth',
    });
    setIsAtBottom(true);
    setUnreadCount(0);
  }, []);

  // Handle dependency changes (new items arriving)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const currentlyNearBottom = distanceFromBottom <= bottomThreshold;

    if (currentlyNearBottom || isAtBottom) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      });
      setIsAtBottom(true);
      setUnreadCount(0);
    } else {
      setUnreadCount((prev) => prev + 1);
    }
  }, [dependency, bottomThreshold]);

  return {
    containerRef,
    isAtBottom,
    unreadCount,
    handleScroll: checkIfAtBottom,
    scrollToBottom,
  };
}
