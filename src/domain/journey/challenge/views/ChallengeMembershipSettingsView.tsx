import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { Trans, useTranslation } from 'react-i18next';
import { ViewProps } from '../../../../core/container/view';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { BlockTitle } from '../../../../core/ui/typography';
import RadioSettingsGroup from '../../../../core/ui/forms/SettingsGroups/RadioSettingsGroup';
import { SpacePrivacyMode, SpaceSettings } from '../../../../core/apollo/generated/graphql-schema';
import PageContent from '../../../../core/ui/content/PageContent';

export interface ChallengeMembershipSettingsViewEntities {
  settings: SpaceSettings; // TODO: create model
}

export interface ChallengeMembershipSettingsViewOptions {
  loading: boolean;
}

export interface ChallengeMembershipSettingsViewState {
  loading: boolean;
  error?: ApolloError;
}

export interface ChallengeMembershipSettingsViewProps
  extends ViewProps<
    ChallengeMembershipSettingsViewEntities,
    ChallengeMembershipSettingsViewState,
    ChallengeMembershipSettingsViewOptions
  > {}

const ChallengeMembershipSettingsView: FC<ChallengeMembershipSettingsViewProps> = ({
  entities,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  actions,
  state,
}) => {
  const { t } = useTranslation();
  const { settings } = entities;
  const { loading } = state;
  //const { onUpdate } = actions;
  return (
    <PageContent background="transparent">
      {!loading && (
        <>
          <PageContentBlock>
            <BlockTitle>{t('pages.admin.space.settings.visibility.title')}</BlockTitle>
            <RadioSettingsGroup
              value={settings?.privacy.mode}
              options={{
                [SpacePrivacyMode.Public]: {
                  label: (
                    <Trans i18nKey="pages.admin.space.settings.visibility.public" components={{ b: <strong /> }} />
                  ),
                },
                [SpacePrivacyMode.Private]: {
                  label: (
                    <Trans i18nKey="pages.admin.space.settings.visibility.private" components={{ b: <strong /> }} />
                  ),
                },
              }}
              onChange={value => handleUpdateSettings(value, undefined, undefined, false)}
            />
          </PageContentBlock>
        </>
      )}
    </PageContent>
  );
};

export default ChallengeMembershipSettingsView;
