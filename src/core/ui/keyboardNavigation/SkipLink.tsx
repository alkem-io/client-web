import { PropsWithChildren } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import visibleOnFocus from './visibleOnFocus';
import { SxProps, Theme } from '@mui/material/styles';

const SKIP_LINK_Z_INDEX = 1;

type SkipLinkProps = {
  sx?: SxProps<Theme>;
  anchor?: Element | null | (() => Element | null);
};

const SkipLink = ({ anchor, sx, children }: PropsWithChildren<SkipLinkProps>) => {
  const { t } = useTranslation();

  const handleClick = () => {
    const anchorElement = typeof anchor === 'function' ? anchor() : anchor;
    if (!anchorElement) {
      return;
    }
    if (anchorElement.tagName === 'BUTTON' || anchorElement.tagName === 'A') {
      (anchorElement as HTMLButtonElement | HTMLAnchorElement).focus();
    }
    anchorElement.querySelector<HTMLElement>('button, [href], input, [tabindex="0"]')?.focus();
  };

  return (
    <Button
      color="primary"
      variant="contained"
      size="small"
      onClick={handleClick}
      sx={visibleOnFocus()({ zIndex: SKIP_LINK_Z_INDEX, textTransform: 'none', ...sx })}
    >
      {children ?? t('buttons.skipLink')}
    </Button>
  );
};

export default SkipLink;
