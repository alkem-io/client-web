import { Box, Fade, useTheme } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import React, { useEffect, useState } from 'react';
import IconButton from '../IconButton';

const SCROLL_OFFSET = 36;

const ScrollButton = () => {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();

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

  return (
    <Fade in={visible}>
      <Box position="fixed" zIndex={theme.zIndex.snackbar - 50} bottom={24} right={24}>
        <IconButton onClick={scrollToTop} size="large">
          <ExpandLess color="inherit" fontSize="large" />
        </IconButton>
      </Box>
    </Fade>
  );
};

export default ScrollButton;
