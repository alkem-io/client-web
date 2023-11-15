import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import visibleOnFocus from './visibleOnFocus';
import { Theme } from '@mui/material/styles';
import { SystemStyleObject } from '@mui/system/styleFunctionSx/styleFunctionSx';

const SKIP_LINK_Z_INDEX = 1;

interface SkipLinkProps {
  sx?: SystemStyleObject<Theme>;
  anchor?: Element | null;
}

const SkipLink = ({ anchor, sx }: SkipLinkProps) => {
  const { t } = useTranslation();

  const handleClick = () => {
    console.log(anchor);

    if (!anchor) {
      return;
    }
    if (anchor.tagName === 'BUTTON' || anchor.tagName === 'A') {
      (anchor as HTMLButtonElement | HTMLAnchorElement).focus();
    }
    // @ts-ignore
    anchor.querySelector('button, [href], input, [tabindex="0"]')?.focus();
  };

  return (
    <Button
      color="primary"
      variant="contained"
      size="small"
      onClick={handleClick}
      sx={visibleOnFocus()({ zIndex: SKIP_LINK_Z_INDEX, textTransform: 'none', ...sx })}
    >
      {t('buttons.skipLink')}
    </Button>
  );
};

export default SkipLink;
