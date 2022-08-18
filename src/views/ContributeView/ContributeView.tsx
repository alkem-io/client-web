import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApolloError } from '@apollo/client';
import { Grid, Paper } from '@mui/material';
import AspectsView, { AspectsViewProps } from '../aspect/AspectsView/AspectsView';
import { AspectWithPermissions } from '../../containers/ContributeTabContainer/ContributeTabContainer';
import CategorySelector, { CategoryConfig } from '../../components/composite/common/CategorySelector/CategorySelector';

export interface ContributeViewProps {
  aspects?: AspectWithPermissions[];
  aspectTypes?: string[];
  loading: boolean;
  error?: ApolloError;
  canReadAspects: boolean;
  canCreateAspects: boolean;
  onCreate: AspectsViewProps['onCreate'];
}

const ContributeView: FC<ContributeViewProps> = ({
  loading,
  aspects,
  aspectTypes = [],
  canReadAspects,
  canCreateAspects,
  onCreate,
}) => {
  const { t } = useTranslation();

  const showAllTitle = t('common.show-all');

  const categoryConfig = useMemo(() => {
    const types = aspectTypes.map<CategoryConfig>(x => ({ title: x }));
    types.unshift({ title: showAllTitle });
    return types;
  }, [aspectTypes, showAllTitle]);
  const [category, setCategory] = useState<string | null>(categoryConfig?.[0]?.title ?? null);
  const shouldSkipFiltering = !category || category === showAllTitle;

  const filteredAspects = useMemo(
    () => (shouldSkipFiltering ? aspects : aspects?.filter(({ type }) => type === category)),
    [shouldSkipFiltering, aspects, category]
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <Paper square variant="outlined">
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
        />
      </Grid>
    </Grid>
  );
};

export default ContributeView;
