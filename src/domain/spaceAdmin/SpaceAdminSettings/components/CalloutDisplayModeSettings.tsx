import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { CalloutDescriptionDisplayMode } from '@/core/apollo/generated/graphql-schema';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { defaultSpaceSettings } from '../SpaceDefaultSettings';
import { SpaceSettingsLayout } from '@/domain/space/settings/SpaceSettingsModel';

type CalloutDisplayModeSettingsProps = {
  currentLayout?: Partial<SpaceSettingsLayout>;
  onUpdate: (params: { layoutSettings: Partial<SpaceSettingsLayout> }) => Promise<void>;
};

const CalloutDisplayModeSettings: FC<CalloutDisplayModeSettingsProps> = ({ currentLayout, onUpdate }) => {
  const { t } = useTranslation();

  const isCollapsed =
    (currentLayout?.calloutDescriptionDisplayMode ?? defaultSpaceSettings.layout.calloutDescriptionDisplayMode) ===
    CalloutDescriptionDisplayMode.Collapsed;

  return (
    <PageContentBlock disableGap>
      <PageContentBlockHeader title={t('pages.admin.generic.sections.layout.calloutDisplayMode.title')} />
      <SwitchSettingsGroup
        ariaLabel={t('pages.admin.generic.sections.layout.calloutDisplayMode.title')}
        options={{
          calloutDescriptionCollapsed: {
            checked: isCollapsed,
            label: t('pages.admin.generic.sections.layout.calloutDisplayMode.description'),
          },
        }}
        onChange={(_setting, newValue) =>
          onUpdate({
            layoutSettings: {
              calloutDescriptionDisplayMode: newValue
                ? CalloutDescriptionDisplayMode.Collapsed
                : CalloutDescriptionDisplayMode.Expanded,
            },
          })
        }
      />
    </PageContentBlock>
  );
};

export default CalloutDisplayModeSettings;
