import { useEffect, useState } from 'react';

export const useFullscreen = (element: HTMLElement = document.documentElement) => {
  const [fullscreen, setFullscreen] = useState(!!document.fullscreenElement);

  const toggleFullscreen = () => {
    setFullscreen(fullscreen => !fullscreen);
  };

  useEffect(() => {
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
    return () => {
      console.log('unsubscribe fullscreen');
    };
  }, [fullscreen]);

  return {
    fullscreen,
    toggleFullscreen,
    setFullscreen,
  };
};
