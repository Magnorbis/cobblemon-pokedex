import { useEffect, useRef } from "react";

function loadMore({ onLoadMore, rootMargin = "500px" }) {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [onLoadMore, rootMargin]);

  return <div ref={elementRef} aria-hidden="true" />
}

export default loadMore;
