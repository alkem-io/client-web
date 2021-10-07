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
          // todo: refactor to use only one container; remove PendingApplicationContainer
          <PendingApplicationContainer key={i} entities={{ application: x }}>
            {(entities, actions, state) => (
              <PendingApplicationView
                key={i}
                entities={{
                  application: x,
                  applicationDetails: entities.applicationDetails,
                  typeName: entities.typeName,
                  url: entities.url,
                }}
                actions={{
                  handleDelete: containerActions.handleDelete,
                  handleDialogOpen: actions.handleDialogOpen,
                  handleDialogClose: actions.handleDialogClose,
                }}
                state={{
                  loading: containerState.loading || state.loading,
                  isDeleting: containerState.isDeleting,
                  isDialogOpened: state.isDialogOpened,
                  loadingDialog: state.loadingDialog,
                }}
                options={containerOptions}
              />
            )}
          </PendingApplicationContainer>
        ))}
      </Card>
    </Box>
  );
};
export default PendingApplicationsView;
