import { LockOutlined } from '@mui/icons-material';
import { gutters } from '@/core/ui/grid/utils';
import { Chip } from '@mui/material';
import { ProfileType } from '@/core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';

interface SpaceSubspaceCardLabelProps {
  type: ProfileType;
  member?: boolean;
  isPrivate?: boolean;
}

const SpaceSubspaceCardLabel = ({ type, member, isPrivate }: SpaceSubspaceCardLabelProps) => {
  const { t } = useTranslation();

  const isSubspace = type !== ProfileType.Space;
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
