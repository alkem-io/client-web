import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TFunction } from 'i18next';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApolloErrorHandler, useUpdateNavigation } from '../../../hooks';
import { useEventOnApplicationMutation } from '../../../hooks/generated/graphql';
import { ApplicationInfoFragment } from '../../../models/graphql-schema';
import { PageProps } from '../../../pages';
import { ApplicationDialog } from '../../composite';

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

interface ApplicationPageProps extends PageProps {
  applications: ApplicationInfoFragment[];
}

export const ApplicationPage: FC<ApplicationPageProps> = ({ paths, applications }) => {
  const { t } = useTranslation();

  const [appChosen, setAppChosen] = useState<ApplicationInfoFragment | undefined>(undefined);

  const currentPaths = useMemo(() => [...paths, { name: 'applications', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

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

  return (
    <>
      <div style={{ height: 400 }}>
        <DataGrid
          disableSelectionOnClick
          rows={applicationsVm}
          columns={colDef(t)}
          density="compact"
          hideFooter={true}
          disableColumnSelector={true}
          onRowClick={param => {
            const appId = param.getValue(param.id, 'id');
            setAppChosen(applications.find(x => x.id === appId));
          }}
        />
      </div>
      {appChosen && (
        <ApplicationDialog app={appChosen} onHide={() => setAppChosen(undefined)} onSetNewState={setNewStateHandler} />
      )}
    </>
  );
};
export default ApplicationPage;

const colDef = (t: TFunction) =>
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
