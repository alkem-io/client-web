import { Box, Fade, useTheme } from '@material-ui/core';
import { ReactComponent as ChevronUpIcon } from 'bootstrap-icons/icons/chevron-up.svg';
import React, { useEffect, useState } from 'react';
import Icon from '../Icon';
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
        <IconButton onClick={scrollToTop}>
          <Icon component={ChevronUpIcon} color="inherit" size={'lg'} />
        </IconButton>
      </Box>
    </Fade>
  );
};

export default ScrollButton;
