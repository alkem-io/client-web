import { FormControl, FormControlLabel, FormGroup, Grid, Skeleton, Switch } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPreference, UserPreferenceType } from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import { SectionSpacer } from '../../components/core/Section/Section';
import { useUserContext } from '../../hooks';

export interface UserNotificationsPageViewEntities {
  preferences: UserPreference[];
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
  const isAnyGlobalAdmin = userMetadata?.isGlobalAdmin || userMetadata?.isGlobalAdminCommunity;
  const isCommunityAdmin = userMetadata?.isCommunityAdmin;

  const { preferences } = entities;
  const { updatePreference } = actions;
  const { loading } = state;

  const generalGroup = preferences.filter(x => x.definition.group === 'Notification');
  const adminGroup = isAnyGlobalAdmin ? preferences.filter(x => x.definition.group === 'NotificationGlobalAdmin') : [];
  const communityGroup = isCommunityAdmin
    ? preferences.filter(x => x.definition.group === 'NotificationCommunityAdmin')
    : [];

  return (
    <Grid container spacing={4}>
      <Grid item xs={6}>
        <NotificationGroupSection
          headerText={t('pages.user-notifications-settings.general.title')}
          subHeaderText={t('pages.user-notifications-settings.general.subtitle')}
          preferences={generalGroup}
          loading={loading}
          onUpdate={(id, type, value) => updatePreference(type, value, id)}
        />
      </Grid>
      {!!(adminGroup.length || communityGroup.length) && (
        <Grid item xs={6}>
          {adminGroup.length > 0 && (
            <NotificationGroupSection
              headerText={t('pages.user-notifications-settings.user-administration.title')}
              subHeaderText={t('pages.user-notifications-settings.user-administration.subtitle')}
              preferences={adminGroup}
              loading={loading}
              onUpdate={(id, type, value) => updatePreference(type, value, id)}
            />
          )}
          {adminGroup.length > 0 && communityGroup.length > 0 && <SectionSpacer />}
          {communityGroup.length > 0 && (
            <NotificationGroupSection
              headerText={t('pages.user-notifications-settings.community-administration.title')}
              subHeaderText={t('pages.user-notifications-settings.community-administration.subtitle')}
              preferences={communityGroup}
              loading={loading}
              onUpdate={(id, type, value) => updatePreference(type, value, id)}
            />
          )}
        </Grid>
      )}
    </Grid>
  );
};
export default UserNotificationsPageView;

interface NotificationGroupSectionProps {
  headerText: string;
  subHeaderText: string;
  preferences: UserPreference[];
  loading?: boolean;
  onUpdate: (id: string, type: UserPreferenceType, value: boolean) => void;
}

const NotificationGroupSection: FC<NotificationGroupSectionProps> = ({
  loading,
  headerText,
  subHeaderText,
  preferences,
  onUpdate,
}) => {
  return (
    <DashboardGenericSection headerText={headerText} subHeaderText={subHeaderText} headerSpacing={'none'}>
      {loading ? (
        <>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </>
      ) : (
        <FormControl>
          <FormGroup>
            {preferences.map(({ value, definition, id }, i) => (
              <FormControlLabel
                key={i}
                aria-label={`notification-${definition.type}`}
                control={
                  <Switch
                    checked={value !== 'false'}
                    name={definition.type}
                    onChange={(event, checked) => onUpdate(id, event.target.name as UserPreferenceType, checked)}
                  />
                }
                label={definition.description}
              />
            ))}
          </FormGroup>
        </FormControl>
      )}
    </DashboardGenericSection>
  );
};
