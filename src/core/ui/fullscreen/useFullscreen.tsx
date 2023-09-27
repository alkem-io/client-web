import { useEffect, useState } from 'react';

export const useFullscreen = (element: HTMLElement = document.documentElement) => {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
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
        } catch (ex) {}
      }
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        try {
          document.exitFullscreen();
        } catch (ex) {}
      }
    }
  };

  return {
    fullscreen: isFullscreen,
    setFullscreen,
  };
};
