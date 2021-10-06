import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@material-ui/core/Box';
import Card from '../../components/core/Card';
import { Loading } from '../../components/core';
import { ApplicationWithType } from '../../utils/application/getApplicationWithType';
import PendingApplicationContainer from '../../containers/application/PendingApplicationContainer';
import PendingApplicationView from './PendingApplicationView';

export interface PendingApplicationsViewEntities {
  applications: ApplicationWithType[];
}

export interface PendingApplicationsViewActions {
  handleDelete: (application: ApplicationWithType) => void;
}

export interface PendingApplicationsViewState {
  isDeleting: boolean;
  loading: boolean;
}

export interface PendingApplicationsViewOptions {
  canEdit: boolean;
}

export interface PendingApplicationsViewProps {
  entities: PendingApplicationsViewEntities;
  actions: PendingApplicationsViewActions;
  state: PendingApplicationsViewState;
  options: PendingApplicationsViewOptions;
}

const PendingApplicationsView: FC<PendingApplicationsViewProps> = ({
  entities: containerEntities,
  actions: containerActions,
  state: containerState,
  options: containerOptions,
}) => {
  const { t } = useTranslation();

  return (
    <Box marginY={1}>
      <Card primaryTextProps={{ text: t('pages.user-profile.applications.title') }}>
        {containerState.loading && <Loading />}
        {containerEntities.applications.map((x, i) => (
          <PendingApplicationContainer key={i} entities={{ application: x }}>
            {(entities, actions, state) => (
              <PendingApplicationView
                key={i}
                application={x}
                applicationDetails={entities.applicationDetails}
                handleDelete={containerActions.handleDelete}
                isDeleting={containerState.isDeleting}
                handleDialogOpen={actions.handleDialogOpen}
                handleDialogClose={actions.handleDialogClose}
                loadingDialog={state.loadingDialog}
                edit={containerOptions.canEdit}
                loading={containerState.loading || state.loading}
                typeName={entities.typeName}
                url={entities.url}
              />
            )}
          </PendingApplicationContainer>
        ))}
      </Card>
    </Box>
  );
};
export default PendingApplicationsView;
