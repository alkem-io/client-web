import { Grid, Box } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Preference, UserPreferenceType } from '../../../../../core/apollo/generated/graphql-schema';
import { ViewProps } from '../../../../../core/container/view';
import { useUserContext } from '../hooks/useUserContext';
import PreferenceSection from '../../../../../common/components/composite/common/PreferenceSection/PreferenceSection';
import { gutters } from '../../../../../core/ui/grid/utils';
import { GUTTER_MUI } from '../../../../../core/ui/grid/constants';

export interface UserNotificationsPageViewEntities {
  preferences: Preference[];
}

export interface UserNotificationsPageViewState {
  loading: boolean;
}

export interface UserNotificationsPageViewActions {
  updatePreference: (type: UserPreferenceType, checked: boolean, id: string) => void;
}

export interface UserNotificationsPageViewProps
  extends ViewProps<
    UserNotificationsPageViewEntities,
    UserNotificationsPageViewActions,
    UserNotificationsPageViewState
  > {}

const UserNotificationsPageView: FC<UserNotificationsPageViewProps> = ({ entities, actions, state }) => {
  const { t } = useTranslation();
  const { user: userMetadata } = useUserContext();
  const isAnyGlobalAdmin = userMetadata?.permissions.isPlatformAdmin;
  const isCommunityAdmin = userMetadata?.isCommunityAdmin;
  const isAnyOrganizationAdmin = userMetadata?.isOrganizationAdmin;

  const { preferences } = entities;
  const { updatePreference } = actions;
  const { loading } = state;

  const generalGroup = preferences.filter(x => x.definition.group === 'Notification');
  const adminGroup = isAnyGlobalAdmin ? preferences.filter(x => x.definition.group === 'NotificationGlobalAdmin') : [];
  const communityGroup = isCommunityAdmin
    ? preferences.filter(x => x.definition.group === 'NotificationCommunityAdmin')
    : [];
  const communicationGroup = preferences.filter(x => x.definition.group === 'NotificationCommunication');
  const orgCommunicationGroup = isAnyOrganizationAdmin
    ? preferences.filter(x => x.definition.group === 'NotificationOrganizationAdmin')
    : [];

  return (
    <Grid container spacing={GUTTER_MUI}>
      <Grid item xs={6}>
        <Box display="flex" gap={gutters()} flexDirection="column">
          <PreferenceSection
            headerText={t('pages.user-notifications-settings.general.title')}
            subHeaderText={t('pages.user-notifications-settings.general.subtitle')}
            preferences={generalGroup}
            loading={loading}
            onUpdate={(id, type, value) => updatePreference(type as UserPreferenceType, value, id)}
          />
          <PreferenceSection
            headerText={t('pages.user-notifications-settings.user-communication.title')}
            subHeaderText={t('pages.user-notifications-settings.user-communication.subtitle')}
            preferences={communicationGroup}
            loading={loading}
            onUpdate={(id, type, value) => updatePreference(type as UserPreferenceType, value, id)}
          />
        </Box>
      </Grid>
      {!!(adminGroup.length || communityGroup.length) && (
        <Grid item xs={6}>
          <Box display="flex" gap={gutters()} flexDirection="column">
            {adminGroup.length > 0 && (
              <PreferenceSection
                headerText={t('pages.user-notifications-settings.user-administration.title')}
                subHeaderText={t('pages.user-notifications-settings.user-administration.subtitle')}
                preferences={adminGroup}
                loading={loading}
                onUpdate={(id, type, value) => updatePreference(type as UserPreferenceType, value, id)}
              />
            )}
            {communityGroup.length > 0 && (
              <PreferenceSection
                headerText={t('pages.user-notifications-settings.community-administration.title')}
                subHeaderText={t('pages.user-notifications-settings.community-administration.subtitle')}
                preferences={communityGroup}
                loading={loading}
                onUpdate={(id, type, value) => updatePreference(type as UserPreferenceType, value, id)}
              />
            )}
          </Box>
        </Grid>
      )}
      {isAnyOrganizationAdmin && (
        <Grid item xs={6}>
          <PreferenceSection
            headerText={t('pages.user-notifications-settings.organization-communication.title')}
            subHeaderText={t('pages.user-notifications-settings.organization-communication.subtitle')}
            preferences={orgCommunicationGroup}
            loading={loading}
            onUpdate={(id, type, value) => updatePreference(type as UserPreferenceType, value, id)}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default UserNotificationsPageView;
