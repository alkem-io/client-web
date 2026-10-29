import { useEffect, useState } from 'react';

export const useFullscreen = (element: HTMLElement = document.documentElement) => {
  // Only `element` itself counts: when something inside the page (a video, a
  // media viewer) goes fullscreen, the page is not, and treating it as such
  // hides the chat — unmounting that very element and ending its fullscreen.
  const [isFullscreen, setIsFullscreen] = useState(document.fullscreenElement === element);

  const handleFullscreenChange = () => {
    setIsFullscreen(document.fullscreenElement === element);
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const setFullscreen = (fullscreen: boolean) => {
    if (fullscreen) {
      if (element.requestFullscreen) {
        try {
          element.requestFullscreen();
        } catch (_error) {}
      }
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        try {
          document.exitFullscreen();
        } catch (_error) {}
      }
    }
  };

  return {
    fullscreen: isFullscreen,
    setFullscreen,
  };
};
