import { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { BlockTitle } from '@/core/ui/typography';
import RadioSettingsGroup from '@/core/ui/forms/SettingsGroups/RadioSettingsGroup';
import { SpacePrivacyMode, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { isSubspace } from '@/domain/space/utils/spaceLevel';

interface VisibilitySettingsProps {
  currentMode?: SpacePrivacyMode;
  level: SpaceLevel;
  onUpdate: (privacyMode: SpacePrivacyMode) => void;
}

export const VisibilitySettings: FC<VisibilitySettingsProps> = ({ currentMode, level, onUpdate }) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <BlockTitle>{t('pages.admin.space.settings.visibility.title')}</BlockTitle>
      <RadioSettingsGroup
        value={currentMode}
        options={{
          [SpacePrivacyMode.Public]: {
            label: (
              <Trans
                i18nKey={`pages.admin.space.settings.visibility.${isSubspace(level) ? 'publicSubspace' : 'public'}`}
                components={{ b: <strong /> }}
              />
            ),
          },
          [SpacePrivacyMode.Private]: {
            label: (
              <Trans
                i18nKey={`pages.admin.space.settings.visibility.${isSubspace(level) ? 'privateSubspace' : 'private'}`}
                components={{ b: <strong /> }}
              />
            ),
          },
        }}
        onChange={onUpdate}
      />
    </PageContentBlock>
  );
};
