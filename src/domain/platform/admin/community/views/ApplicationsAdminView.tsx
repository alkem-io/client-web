import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TFunction } from 'i18next';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApolloErrorHandler } from '../../../../../core/apollo/hooks/useApolloErrorHandler';
import { useEventOnApplicationMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import { ApplicationInfoFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { ApplicationDialog } from '../../../../community/application/dialogs/ApplicationDialog';
import { Box } from '@mui/material';
import DashboardGenericSection from '../../../../shared/components/DashboardSections/DashboardGenericSection';

interface ApplicationViewmodel {
  id: string;
  username: string;
  email: string;
  state: string;
}

const toApplicationViewmodel = (applications: ApplicationInfoFragment[]): ApplicationViewmodel[] =>
  applications.map(x => ({
    id: x.id,
    username: x.user.displayName,
    email: x.user.email,
    state: x.lifecycle?.state || '',
  }));

interface ApplicationsAdminViewProps {
  applications: ApplicationInfoFragment[];
}

export const ApplicationsAdminView: FC<ApplicationsAdminViewProps> = ({ applications }) => {
  const { t } = useTranslation();

  const [appChosen, setAppChosen] = useState<ApplicationInfoFragment | undefined>(undefined);

  const applicationsVm = useMemo(() => toApplicationViewmodel(applications), [applications]);

  const handleError = useApolloErrorHandler();

  const [updateApplication] = useEventOnApplicationMutation({
    onError: handleError,
  });

  const setNewStateHandler = (appId: string, newState: string) => {
    updateApplication({
      variables: {
        input: {
          applicationID: appId,
          eventName: newState,
        },
      },
    });
  };

  const columnDefinitions = useMemo(() => getColumnDefinitions(t), [t]);

  return (
    <DashboardGenericSection headerText={t('common.applications')}>
      <Box height={400}>
        <DataGrid
          disableSelectionOnClick
          rows={applicationsVm}
          columns={columnDefinitions}
          density="compact"
          hideFooter
          disableColumnSelector
          onRowClick={param => {
            const appId = param.getValue(param.id, 'id');
            setAppChosen(applications.find(x => x.id === appId));
          }}
        />
      </Box>
      {appChosen && (
        <ApplicationDialog app={appChosen} onHide={() => setAppChosen(undefined)} onSetNewState={setNewStateHandler} />
      )}
    </DashboardGenericSection>
  );
};
export default ApplicationsAdminView;

const getColumnDefinitions = (t: TFunction) =>
  [
    {
      field: 'username',
      headerName: t('common.username'),
      flex: 1,
    },
    {
      field: 'email',
      headerName: t('common.email'),
      flex: 1,
    },
    {
      field: 'state',
      headerName: t('common.state'),
      flex: 1,
      valueFormatter: x => {
        const value = x.value as string;
        return value.charAt(0).toUpperCase() + value.slice(1);
      },
    },
  ] as GridColDef[];
