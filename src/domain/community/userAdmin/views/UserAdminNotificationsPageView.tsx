import { Grid, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AuthorizationPrivilege, Preference, PreferenceType } from '@/core/apollo/generated/graphql-schema';
import { ViewProps } from '@/core/container/view';
import { useUserContext } from '@/domain/community/user';
import PreferenceSection from '@/main/ui/settings/PreferenceSection';
import { gutters } from '@/core/ui/grid/utils';
import { GUTTER_MUI } from '@/core/ui/grid/constants';

export interface UserNotificationsPageViewEntities {
  preferences: Preference[];
}

export interface UserNotificationsPageViewState {
  loading: boolean;
}

export interface UserNotificationsPageViewActions {
  updatePreference: (type: PreferenceType, checked: boolean, id: string) => void;
}

export interface UserNotificationsPageViewProps
  extends ViewProps<
    UserNotificationsPageViewEntities,
    UserNotificationsPageViewActions,
    UserNotificationsPageViewState
  > {}

const UserNotificationsPageView = ({ entities, actions, state }: UserNotificationsPageViewProps) => {
  const { t } = useTranslation();
  const { user: userMetadata } = useUserContext();
  const isPlatformAdmin = userMetadata?.hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin) ?? false;

  const { preferences } = entities;
  const { updatePreference } = actions;
  const { loading } = state;

  const generalGroup = preferences.filter(x => x.definition.group === 'Notification');
  const adminGroup = isPlatformAdmin ? preferences.filter(x => x.definition.group === 'NotificationGlobalAdmin') : [];
  // TODO hide when a user doesn't administer any community
  const communityGroup = preferences.filter(x => x.definition.group === 'NotificationCommunityAdmin');
  const communicationGroup = preferences.filter(x => x.definition.group === 'NotificationCommunication');
  // TODO hide when a user doesn't administer any organization
  const orgCommunicationGroup = preferences.filter(x => x.definition.group === 'NotificationOrganizationAdmin');
  const forumGroup = preferences.filter(x => x.definition.group === 'NotificationForum');

  return (
    <Grid container spacing={GUTTER_MUI}>
      <Grid item xs={6}>
        <Box display="flex" gap={gutters()} flexDirection="column">
          <PreferenceSection
            headerText={t('pages.user-notifications-settings.general.title')}
            subHeaderText={t('pages.user-notifications-settings.general.subtitle')}
            preferences={generalGroup}
            loading={loading}
            onUpdate={(id, type, value) => updatePreference(type as PreferenceType, value, id)}
          />
          <PreferenceSection
            headerText={t('pages.user-notifications-settings.user-communication.title')}
            subHeaderText={t('pages.user-notifications-settings.user-communication.subtitle')}
            preferences={communicationGroup}
            loading={loading}
            onUpdate={(id, type, value) => updatePreference(type as PreferenceType, value, id)}
          />
          {orgCommunicationGroup && (
            <PreferenceSection
              headerText={t('pages.user-notifications-settings.organization-communication.title')}
              subHeaderText={t('pages.user-notifications-settings.organization-communication.subtitle')}
              preferences={orgCommunicationGroup}
              loading={loading}
              onUpdate={(id, type, value) => updatePreference(type as PreferenceType, value, id)}
            />
          )}
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Box display="flex" gap={gutters()} flexDirection="column">
          <PreferenceSection
            headerText={t('pages.user-notifications-settings.forum.title')}
            subHeaderText={t('pages.user-notifications-settings.forum.subtitle')}
            preferences={forumGroup}
            loading={loading}
            onUpdate={(id, type, value) => updatePreference(type as PreferenceType, value, id)}
          />
          {!!(adminGroup.length || communityGroup.length) && (
            <>
              {adminGroup.length > 0 && (
                <PreferenceSection
                  headerText={t('pages.user-notifications-settings.user-administration.title')}
                  subHeaderText={t('pages.user-notifications-settings.user-administration.subtitle')}
                  preferences={adminGroup}
                  loading={loading}
                  onUpdate={(id, type, value) => updatePreference(type as PreferenceType, value, id)}
                />
              )}
              {communityGroup.length > 0 && (
                <PreferenceSection
                  headerText={t('pages.user-notifications-settings.community-administration.title')}
                  subHeaderText={t('pages.user-notifications-settings.community-administration.subtitle')}
                  preferences={communityGroup}
                  loading={loading}
                  onUpdate={(id, type, value) => updatePreference(type as PreferenceType, value, id)}
                />
              )}
            </>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default UserNotificationsPageView;
