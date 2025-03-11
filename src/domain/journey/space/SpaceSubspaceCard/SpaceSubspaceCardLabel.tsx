import { LockOutlined } from '@mui/icons-material';
import { gutters } from '@/core/ui/grid/utils';
import { Chip } from '@mui/material';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';

interface SpaceSubspaceCardLabelProps {
  level: SpaceLevel;
  member?: boolean;
  isPrivate?: boolean;
}

const SpaceSubspaceCardLabel = ({ level, member, isPrivate }: SpaceSubspaceCardLabelProps) => {
  const { t } = useTranslation();

  const isSubspace = level !== SpaceLevel.L0;
  const spaceTypeName = isSubspace ? t('common.subspace') : t('common.space');
  const labelType = member ? 'member' : isPrivate ? 'private' : 'public';
  const label = t(`components.card.privacy.${labelType}` as const, { entity: spaceTypeName });

  return (
    <Chip
      variant="filled"
      color="primary"
      label={label}
      icon={isPrivate ? <LockOutlined /> : undefined}
      sx={{ position: 'absolute', bottom: gutters(0.5), left: gutters(0.5) }}
    />
  );
};

export default SpaceSubspaceCardLabel;
