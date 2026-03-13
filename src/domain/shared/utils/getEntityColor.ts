import type { Theme } from '@mui/material/styles';
import type { EntityTypeName } from '@/domain/platform/constants/EntityTypeName';

const getEntityColor = (theme: Theme, _entityTypeName: EntityTypeName | 'admin' | 'profile') => {
  return theme.palette.primary.main;
};

export default getEntityColor;
