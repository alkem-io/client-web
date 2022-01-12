import {
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  Skeleton,
  Switch,
} from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPreference } from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';

export interface UserNotificationsPageViewEntities {
  preferences: UserPreference[];
}

export interface UserNotificationsPageViewState {
  loading: boolean;
}

export interface UserNotificationsPageViewActions {
  updatePreference: (name: string, checked: boolean, id: string) => void;
}

export interface UserNotificationsPageViewProps
  extends ViewProps<
    UserNotificationsPageViewEntities,
    UserNotificationsPageViewActions,
    UserNotificationsPageViewState
  > {}

const UserNotificationsPageView: FC<UserNotificationsPageViewProps> = ({ entities, actions, state }) => {
  const { t } = useTranslation();

  const { preferences } = entities;
  const { updatePreference } = actions;
  const { loading } = state;

  return (
    <Grid container rowSpacing={4}>
      <Grid item xs={6}>
        <Card>
          <CardHeader
            title={t('pages.user-notfications-settings.email-notifications.title')}
            subheader={t('pages.user-notfications-settings.email-notifications.subheader')}
          />
          <CardContent>
            {loading ? (
              <>
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </>
            ) : (
              <FormControl>
                <FormGroup>
                  {preferences.map((p, i) => (
                    <FormControlLabel
                      key={i}
                      control={
                        <Switch
                          checked={p.value !== 'false'}
                          name={p.definition.type}
                          onChange={(event, checked) => updatePreference(event.target.name, checked, p.id)}
                        />
                      }
                      label={p.definition.description}
                      data-test-id={p.definition.type}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
export default UserNotificationsPageView;
