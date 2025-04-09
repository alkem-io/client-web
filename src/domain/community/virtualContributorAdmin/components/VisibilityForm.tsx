import { useUpdateVirtualContributorMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContent from '@/core/ui/content/PageContent';
import { Trans, useTranslation } from 'react-i18next';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import RadioSettingsGroup from '@/core/ui/forms/SettingsGroups/RadioSettingsGroup';
import { SearchVisibility } from '@/core/apollo/generated/graphql-schema';
import { BlockTitle } from '@/core/ui/typography';

type VCAccessibilityProps = {
  listedInStore?: boolean;
  searchVisibility?: SearchVisibility;
};

const VisibilityForm = ({ vc }) => {
  const { t } = useTranslation();
  const notify = useNotification();

  const [updateContributorMutation] = useUpdateVirtualContributorMutation();
  const handleUpdate = (props: VCAccessibilityProps) => {
    updateContributorMutation({
      variables: {
        virtualContributorData: {
          ID: vc?.id ?? '',
          ...props,
        },
      },
      onCompleted: () => {
        notify(t('pages.virtualContributorProfile.success', { entity: t('common.settings') }), 'success');
      },
    });
  };

  const updateListedInStore = (newValue: boolean) => {
    handleUpdate({ listedInStore: newValue });
  };

  const updateVisibility = (newValue: SearchVisibility) => {
    handleUpdate({ searchVisibility: newValue });
  };

  if (!vc) {
    return null;
  }

  return (
    <PageContent background="background.paper">
      <PageContentColumn columns={12}>
        <PageContentBlock>
          <BlockTitle>{t('pages.virtualContributorProfile.settings.access.title')}</BlockTitle>
          <RadioSettingsGroup
            value={vc?.searchVisibility ?? SearchVisibility.Account}
            options={{
              [SearchVisibility.Public]: {
                label: (
                  <Trans
                    i18nKey="pages.virtualContributorProfile.settings.access.visibility.public"
                    components={{ b: <strong /> }}
                  />
                ),
              },
              [SearchVisibility.Account]: {
                label: (
                  <Trans
                    i18nKey="pages.virtualContributorProfile.settings.access.visibility.private"
                    components={{ b: <strong /> }}
                  />
                ),
              },
              [SearchVisibility.Hidden]: {
                label: (
                  <Trans
                    i18nKey="pages.virtualContributorProfile.settings.access.visibility.hidden"
                    components={{ b: <strong /> }}
                  />
                ),
              },
            }}
            onChange={newValue => updateVisibility(newValue)}
          />
          <SwitchSettingsGroup
            options={{
              listedInStore: {
                checked: vc?.listedInStore ?? false,
                disabled: vc?.searchVisibility !== SearchVisibility.Public,
                label: t('pages.virtualContributorProfile.settings.access.listedInStore'),
              },
            }}
            onChange={(_key, newValue) => updateListedInStore(newValue)}
          />
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};

export default VisibilityForm;
