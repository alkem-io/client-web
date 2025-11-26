import { Box } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import RouterLink from '@/core/ui/link/RouterLink';
import { useTranslation } from 'react-i18next';
import { ParentInfo } from '@/domain/space/components/cards/utils/useSubspaceCardData';

interface SpaceParentInfoProps {
  parent?: ParentInfo;
}

const SpaceParentInfo = ({ parent }: SpaceParentInfoProps) => {
  const { t } = useTranslation();

  if (!parent) {
    return null;
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={0.5}
      component={RouterLink}
      to={parent.url}
      sx={{
        textDecoration: 'none',
        '&:hover': {
          '& .MuiTypography-root': {
            textDecoration: 'underline',
          },
        },
      }}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
    >
      <Caption
        noWrap
        component="dd"
        sx={{
          color: 'primary.main',
        }}
      >
        {t('components.card.parentSpace', { space: parent.displayName })}
      </Caption>
    </Box>
  );
};

export default SpaceParentInfo;
