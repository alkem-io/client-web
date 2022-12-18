import { Theme } from '@mui/material/styles';
import { EntityTypeName } from '../layout/LegacyPageLayout/SimplePageLayout';

const getEntityColor = (theme: Theme, _entityTypeName: EntityTypeName | 'admin' | 'profile') => {
  return theme.palette.primary.main;
};

export default getEntityColor;
