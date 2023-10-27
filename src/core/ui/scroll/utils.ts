import { useEffect, useRef, useState } from 'react';

const useScrollListener = (onScroll: (scrollTop: number) => void, element?: Element) => {
  useEffect(() => {
    const eventHandler = element ?? window;
    const scrollContainer = element ?? document.documentElement;

    const handleScroll = () => {
      onScroll(scrollContainer.scrollTop);
    };

    eventHandler.addEventListener('scroll', handleScroll);

    return () => {
      eventHandler.removeEventListener('scroll', handleScroll);
    };
  }, [element]);
};

export const useScrollTop = (element?: Element) => {
  const [scrollTop, setScrollTop] = useState(0);

  useScrollListener(setScrollTop, element);

  return scrollTop;
};

export const useScrolledUp = (element?: Element) => {
  const [hasScrolledUp, setHasScrolledUp] = useState(false);

  const scrollTopRef = useRef(0);

  const handleScroll = (scrollTop: number) => {
    const lastScrollTop = scrollTopRef.current;

    scrollTopRef.current = scrollTop;

    setHasScrolledUp(scrollTop < lastScrollTop);
  };

  useScrollListener(handleScroll, element);

  return hasScrolledUp;
};
