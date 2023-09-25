import { useEffect, useState } from 'react';

export const useFullscreen = (element: HTMLElement = document.documentElement) => {
  const [fullscreenState, setFullscreenState] = useState(!!document.fullscreenElement);

  const fullscreenChanged = () => {
    setFullscreenState(!!document.fullscreenElement);
  };
  useEffect(() => {
    document.addEventListener('fullscreenchange', fullscreenChanged);
    return () => {
      document.removeEventListener('fullscreenchange', fullscreenChanged);
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

  const toggleFullscreen = () => {
    setFullscreen(!fullscreenState);
  };

  return {
    fullscreen: fullscreenState,
    toggleFullscreen,
    setFullscreen,
  };
};
