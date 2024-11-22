import { useEffect, useState } from 'react';
import { IconButton } from '@mui/material';
import scrollToTop from '../utils/scrollToTop';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useTranslation } from 'react-i18next';

const SCROLL_OFFSET = 36;

const ScrollToTop = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

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
    <IconButton onClick={scrollToTop} title={t('buttons.scrollToTop')} aria-label={t('buttons.scrollToTop')}>
      <ExpandLessIcon color="primary" fontSize="large" />
    </IconButton>
  );
};

export default ScrollToTop;
