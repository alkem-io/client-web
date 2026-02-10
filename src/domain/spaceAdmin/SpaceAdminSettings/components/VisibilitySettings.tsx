import { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import GppMaybeOutlinedIcon from '@mui/icons-material/GppMaybeOutlined';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { BlockTitle, Caption } from '@/core/ui/typography';
import RadioSettingsGroup from '@/core/ui/forms/SettingsGroups/RadioSettingsGroup';
import { CommunityMembershipPolicy, SpacePrivacyMode, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { isSubspace } from '@/domain/space/utils/spaceLevel';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';

interface VisibilitySettingsProps {
  currentMode?: SpacePrivacyMode;
  currentMembershipPolicy?: CommunityMembershipPolicy;
  level: SpaceLevel;
  onUpdate: (privacyMode: SpacePrivacyMode) => void;
}

export const VisibilitySettings: FC<VisibilitySettingsProps> = ({
  currentMode,
  currentMembershipPolicy,
  level,
  onUpdate,
}) => {
  const { t } = useTranslation();

  const showMembershipWarning =
    currentMode === SpacePrivacyMode.Private && currentMembershipPolicy === CommunityMembershipPolicy.Open;

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
      {showMembershipWarning && (
        <Gutters disablePadding row alignItems="flex-start" gap={gutters(0.5)}>
          <GppMaybeOutlinedIcon fontSize="small" color="error" />
          <Caption>
            <Trans
              i18nKey={'pages.admin.space.settings.visibility.membershipWarning'}
              components={{ b: <strong /> }}
              values={{ entity: t(isSubspace(level) ? 'common.subspace' : 'common.space') }}
            />
          </Caption>
        </Gutters>
      )}
    </PageContentBlock>
  );
};
