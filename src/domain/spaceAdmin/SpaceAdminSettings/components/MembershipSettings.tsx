import { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { BlockTitle, BlockSectionTitle } from '@/core/ui/typography';
import RadioSettingsGroup from '@/core/ui/forms/SettingsGroups/RadioSettingsGroup';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import RouterLink from '@/core/ui/link/RouterLink';
import { CommunityMembershipPolicy, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import scrollToTop from '@/core/ui/utils/scrollToTop';
import { isSubspace, isNotLastLevel } from '@/domain/space/utils/spaceLevel';

interface MembershipSettingsProps {
  currentPolicy?: CommunityMembershipPolicy;
  hostOrganizationTrusted: boolean;
  providerDisplayName?: string;
  level: SpaceLevel;
  onUpdate: (params: { membershipPolicy?: CommunityMembershipPolicy; hostOrganizationTrusted?: boolean }) => void;
}

export const MembershipSettings: FC<MembershipSettingsProps> = ({
  currentPolicy,
  hostOrganizationTrusted,
  providerDisplayName,
  level,
  onUpdate,
}) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <BlockTitle>{t('pages.admin.space.settings.membership.title')}</BlockTitle>
      <RadioSettingsGroup
        value={currentPolicy}
        options={{
          [CommunityMembershipPolicy.Open]: {
            label: <Trans i18nKey="pages.admin.space.settings.membership.open" components={{ b: <strong /> }} />,
          },
          [CommunityMembershipPolicy.Applications]: {
            label: (
              <Trans
                i18nKey="pages.admin.space.settings.membership.applications"
                components={{
                  b: <strong />,
                  community: <RouterLink to={`../${SettingsSection.Community}`} onClick={scrollToTop} />,
                }}
              />
            ),
          },
          ...(isNotLastLevel(level) && {
            [CommunityMembershipPolicy.Invitations]: {
              label: (
                <Trans
                  i18nKey="pages.admin.space.settings.membership.invitations"
                  components={{
                    b: <strong />,
                    community: <RouterLink to={`../${SettingsSection.Community}`} onClick={scrollToTop} />,
                  }}
                />
              ),
            },
          }),
        }}
        onChange={value => onUpdate({ membershipPolicy: value })}
      />
      {!isSubspace(level) && (
        <>
          <BlockSectionTitle>{t('pages.admin.space.settings.membership.trustedApplicants')}</BlockSectionTitle>
          <SwitchSettingsGroup
            options={{
              hostOrganizationTrusted: {
                checked: hostOrganizationTrusted,
                label: (
                  <Trans
                    t={t}
                    i18nKey="pages.admin.space.settings.membership.hostOrganizationJoin"
                    values={{
                      host: providerDisplayName,
                    }}
                    components={{ b: <strong />, i: <em /> }}
                  />
                ),
              },
            }}
            onChange={(setting, newValue) => onUpdate({ [setting]: newValue })}
          />
        </>
      )}
    </PageContentBlock>
  );
};
