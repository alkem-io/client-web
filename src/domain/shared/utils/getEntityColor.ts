import { Theme } from '@mui/material/styles';
import { EntityTypeName } from '../layout/PageLayout/SimplePageLayout';

const getEntityColor = (theme: Theme, entityTypeName: EntityTypeName | 'admin') => {
  return entityTypeName in theme.palette ? theme.palette[entityTypeName].main : theme.palette.primary.main;
};

export default getEntityColor;
