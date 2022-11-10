import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import React, { useEffect, useState } from 'react';
import IconButton from '../../IconButton';

const SCROLL_OFFSET = 36;

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const toggleVisible = () => {
      const scrolled = document.documentElement.scrollTop;
      setVisible(scrolled > SCROLL_OFFSET);
    };
    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  if (!visible) return null;

  return (
    <IconButton onClick={scrollToTop} size="large">
      <ExpandLessIcon color="inherit" fontSize="large" />
    </IconButton>
  );
};

export default ScrollToTop;
