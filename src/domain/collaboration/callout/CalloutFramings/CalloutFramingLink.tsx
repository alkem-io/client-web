import { Button, SxProps, Theme, Tooltip } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { CalloutDetailsModel } from '../models/CalloutDetailsModel';
import Gutters, { GuttersProps } from '@/core/ui/grid/Gutters';
import { useTranslation } from 'react-i18next';
import { Caption } from '@/core/ui/typography';
import useNavigate from '@/core/routing/useNavigate';

interface CalloutFramingLinkProps {
  callout: CalloutDetailsModel;
  sx?: SxProps<Theme>;
  containerProps?: GuttersProps;
}

const CalloutFramingLink = ({ callout, sx, containerProps }: CalloutFramingLinkProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!callout.framing?.link) {
    return null;
  }

  const { uri, profile } = callout.framing.link;
  const displayName = profile.displayName || 'Link';

  // Improved link validation and security checks
  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      // Only allow http and https protocols for security
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const isValidLink = isValidUrl(uri);

  // If link is invalid, don't render anything or show error state
  if (!isValidLink) {
    return (
      <Gutters {...containerProps}>
        <Button variant="outlined" color="error" fullWidth disabled sx={sx}>
          {t('forms.validations.invalidUrl')}
        </Button>
      </Gutters>
    );
  }

  // Determine if it's an external link
  const urlObj = new URL(uri);
  const currentOrigin = window.location.origin;
  const isExternalLink = urlObj.origin !== currentOrigin;

  const handleLinkClick = () => {
    if (isExternalLink) {
      window.open(uri, '_blank', 'noopener,noreferrer');
    } else {
      navigate(uri);
    }
  };

  const buttonContent = (
    <Button
      variant="contained"
      color="primary"
      fullWidth
      onClick={handleLinkClick}
      endIcon={isExternalLink ? <OpenInNewIcon /> : undefined}
      sx={sx}
    >
      {displayName}
    </Button>
  );

  if (isExternalLink) {
    return (
      <Gutters {...containerProps}>
        <Tooltip
          title={
            <>
              <Caption>{t('common.externalLinkDisclaimer')}</Caption>
              <Caption>{uri}</Caption>
            </>
          }
        >
          {buttonContent}
        </Tooltip>
      </Gutters>
    );
  }

  return (
    <Gutters {...containerProps}>
      <Tooltip title={<Caption>{uri}</Caption>}>{buttonContent}</Tooltip>
    </Gutters>
  );
};

export default CalloutFramingLink;
