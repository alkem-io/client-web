import { useState } from 'react';

export const useFullscreen = () => {
  const [fullscreen, setFullscreen] = useState(!!document.fullscreenElement);

  const toggleFullscreen = (element: HTMLElement = document.documentElement) => {
    if (fullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setFullscreen(false);
      }
    } else {
      if (element.requestFullscreen) {
        element.requestFullscreen({});
        setFullscreen(true);
      }
    }
  };
  return {
    fullscreen,
    toggleFullscreen,
  };
};
