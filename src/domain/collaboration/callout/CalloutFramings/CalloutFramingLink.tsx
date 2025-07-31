import { Button, SxProps, Theme, Tooltip } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { TypedCalloutDetails } from '../models/TypedCallout';
import Gutters, { GuttersProps } from '@/core/ui/grid/Gutters';
import { useTranslation } from 'react-i18next';

interface CalloutFramingLinkProps {
  callout: TypedCalloutDetails;
  sx?: SxProps<Theme>;
  containerProps?: GuttersProps;
}

const CalloutFramingLink = ({ callout, sx, containerProps }: CalloutFramingLinkProps) => {
  const { t } = useTranslation();

  if (!callout.framing?.link) {
    return null;
  }

  const { uri, profile } = callout.framing.link;
  const displayName = profile.displayName || 'Link';

  // Check if it's an external link
  // Internal: relative paths (starting with /) or same origin URLs
  // External: everything else (http/https to different domains)
  const isExternalLink =
    uri.startsWith('http://') || uri.startsWith('https://') ? !uri.startsWith(window.location.origin) : false;

  const handleLinkClick = () => {
    if (isExternalLink) {
      window.open(uri, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = uri;
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
        <Tooltip title={t('common.externalLinkDisclaimer')}>{buttonContent}</Tooltip>
      </Gutters>
    );
  }

  // For internal links, show URL in tooltip
  return (
    <Gutters {...containerProps}>
      <Tooltip title={uri}>{buttonContent}</Tooltip>
    </Gutters>
  );
};

export default CalloutFramingLink;
