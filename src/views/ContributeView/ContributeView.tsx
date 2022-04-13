import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApolloError } from '@apollo/client';
import { Box, Grid, Paper } from '@mui/material';
import AspectsView from '../aspect/AspectsView/AspectsView';
import { AspectCreationOutput } from '../../components/composite/aspect/AspectCreationDialog/AspectCreationDialog';
import { AspectWithPermissions } from '../../containers/ContributeTabContainer/ContributeTabContainer';
import CategorySelector, {
  CATEGORY_ALL,
  CategoryConfig,
} from '../../components/composite/common/CategorySelector/CategorySelector';

export interface ContributeViewProps {
  aspects?: AspectWithPermissions[];
  aspectTypes?: string[];
  loading: boolean;
  error?: ApolloError;
  canReadAspects: boolean;
  canCreateAspects: boolean;
  onCreate: (aspect: AspectCreationOutput) => void;
  onDelete: (id: string) => void;
}

const ContributeView: FC<ContributeViewProps> = ({
  loading,
  aspects,
  aspectTypes = [],
  canReadAspects,
  canCreateAspects,
  onCreate,
  onDelete,
}) => {
  const { t } = useTranslation();

  const categoryConfig = useMemo(() => aspectTypes.map<CategoryConfig>(x => ({ title: x })), [aspectTypes]);
  const [category, setCategory] = useState<string>(CATEGORY_ALL);

  const filteredAspects = useMemo(
    () => aspects?.filter(({ type }) => category === CATEGORY_ALL || type === category),
    [aspects, category]
  );
  return (
    <>
      <Box paddingBottom={2} display="flex" justifyContent="center">
        {t('pages.hub.sections.contribute.description')}
      </Box>
      <Box paddingBottom={2} display="flex" justifyContent="center">
        {t('pages.hub.sections.contribute.description2')}
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Paper square variant={'outlined'}>
            <CategorySelector categories={categoryConfig} value={category} onSelect={setCategory} />
          </Paper>
        </Grid>
        <Grid item xs>
          <AspectsView
            aspects={filteredAspects}
            aspectsLoading={loading}
            canReadAspects={canReadAspects}
            canCreateAspects={canCreateAspects}
            onCreate={onCreate}
            onDelete={onDelete}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ContributeView;
