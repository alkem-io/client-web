import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';

interface SpaceVisibilityBannerProps {
  visibility?: SpaceVisibility;
}

const SpaceVisibilityBanner = ({ visibility }: SpaceVisibilityBannerProps) => {
  const { t } = useTranslation();

  return (
    <Chip
      label={t(`common.enums.space-visibility.${visibility || 'DEMO'}` as const)}
      size="small"
      color="primary"
      sx={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        fontWeight: 600,
        borderRadius: 0,
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px',
        zIndex: 1,
        paddingX: 2,
      }}
    />
  );
};

export default SpaceVisibilityBanner;
