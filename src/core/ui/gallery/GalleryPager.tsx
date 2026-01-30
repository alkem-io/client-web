import React, { useEffect } from 'react';
import { Box, styled, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { BoxProps } from '@mui/system';
import { gutters } from '../grid/utils';
import { useTranslation } from 'react-i18next';

const PagerContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  padding: '16px 0',
}));

const DotsContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const Dot = styled('button')<{ selected: boolean }>(({ selected }) => ({
  boxSizing: 'content-box',
  backgroundClip: 'padding-box',
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: 'white',
  border: '2px solid transparent',
  cursor: 'pointer',
  filter: 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.6))',
  transition: 'all 0.2s ease',
  padding: 0,
  '&:hover': {
    transform: 'scale(1.2)',
  },
  '&:focus-visible': {
    outline: '2px solid white',
    outlineOffset: '2px',
  },
  boxShadow: selected ? '0 0 0 1px white' : 'none',
}));

const NavButton = styled(IconButton)(({ theme }) => ({
  boxSizing: 'content-box',
  height: gutters(1)(theme),
  width: gutters(1)(theme),
  color: 'white',
  '&:hover': {
    transform: 'scale(1.2)',
  },
  filter: 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.6))',
}));

interface GalleryPagerProps {
  totalItems: number;
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onDotClick: (index: number) => void;
  containerProps?: BoxProps;
  disableKeyboardNavigation?: boolean;
}

const GalleryPager = ({
  totalItems,
  currentIndex,
  onPrevious,
  onNext,
  onDotClick,
  containerProps,
  disableKeyboardNavigation,
}: GalleryPagerProps) => {
  const { t } = useTranslation();
  useEffect(() => {
    if (disableKeyboardNavigation) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onPrevious();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onNext, onPrevious, disableKeyboardNavigation]);

  if (totalItems <= 1) {
    return null;
  }

  return (
    <PagerContainer
      role="navigation"
      aria-label={t('components.callout-creation.framing.mediaGallery.navigation.ariaLabel')}
      {...containerProps}
    >
      <NavButton
        onClick={onPrevious}
        size="small"
        aria-label={t('components.callout-creation.framing.mediaGallery.navigation.previous')}
      >
        <ChevronLeftIcon />
      </NavButton>
      <DotsContainer>
        {Array.from({ length: totalItems }).map((_, index) => (
          <Dot
            key={index}
            selected={index === currentIndex}
            onClick={() => onDotClick(index)}
            aria-label={t('components.callout-creation.framing.mediaGallery.navigation.goToImage', {
              number: index + 1,
            })}
            aria-current={index === currentIndex ? 'true' : 'false'}
          />
        ))}
      </DotsContainer>
      <NavButton
        onClick={onNext}
        size="small"
        aria-label={t('components.callout-creation.framing.mediaGallery.navigation.next')}
      >
        <ChevronRightIcon />
      </NavButton>
    </PagerContainer>
  );
};

export default GalleryPager;
