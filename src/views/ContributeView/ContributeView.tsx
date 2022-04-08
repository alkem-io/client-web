import { ApolloError } from '@apollo/client';
import Box from '@mui/material/Box';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import AspectsView from '../aspect/AspectsView/AspectsView';
import { AspectCreationOutput } from '../../components/composite/aspect/AspectCreationDialog/AspectCreationDialog';
import { AspectWithPermissions } from '../../containers/ContributeTabContainer/ContributeTabContainer';

export interface ContributeViewProps {
  aspects?: AspectWithPermissions[];
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
  canReadAspects,
  canCreateAspects,
  onCreate,
  onDelete,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <Box paddingBottom={2} display="flex" justifyContent="center">
        {t('pages.hub.sections.contribute.description')}
      </Box>
      <Box paddingBottom={2} display="flex" justifyContent="center">
        {t('pages.hub.sections.contribute.description2')}
      </Box>
      <AspectsView
        aspects={aspects}
        aspectsLoading={loading}
        canReadAspects={canReadAspects}
        canCreateAspects={canCreateAspects}
        onCreate={onCreate}
        onDelete={onDelete}
      />
    </>
  );
};

export default ContributeView;
