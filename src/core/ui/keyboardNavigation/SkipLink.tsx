import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import visibleOnFocus from './visibleOnFocus';
import { Theme } from '@mui/material/styles';
import { SystemStyleObject } from '@mui/system/styleFunctionSx/styleFunctionSx';
import { useNavigate } from 'react-router-dom';

const SKIP_LINK_Z_INDEX = 1;

interface SkipLinkProps {
  sx?: SystemStyleObject<Theme>;
  anchor: string;
}

const SkipLink = ({ anchor, sx }: SkipLinkProps) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const onClick = () => {
    navigate(`#${anchor}`);
    // @ts-ignore
    document.getElementById(anchor)?.querySelector('button, [href], input, [tabindex="0"]')?.focus();
  };

  return (
    <Button
      color="primary"
      variant="contained"
      size="small"
      onClick={onClick}
      sx={visibleOnFocus()({ zIndex: SKIP_LINK_Z_INDEX, textTransform: 'none', ...sx })}
    >
      {t('buttons.skipLink')}
    </Button>
  );
};

export default SkipLink;
