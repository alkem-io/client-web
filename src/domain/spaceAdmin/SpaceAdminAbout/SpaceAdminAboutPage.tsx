import { useSpaceAboutDetailsQuery, useUpdateSpaceMutation } from '@/core/apollo/generated/apollo-hooks';
import { SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';
import { Actions } from '@/core/ui/actions/Actions';
import SaveButton from '@/core/ui/actions/SaveButton';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { formatLocation } from '@/domain/common/location/LocationUtils';
import ProfileForm, { ProfileFormValues } from '@/domain/common/profile/ProfileForm';
import EditVisualsView from '@/domain/common/visual/EditVisuals/EditVisualsView';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platformAdmin/layout/EntitySettingsLayout/types';
import { compact } from 'lodash';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import LayoutSwitcher from '../layout/SpaceAdminLayoutSwitcher';
import SpaceAboutView from './components/SpaceAboutView';
import { EmptyProfileModel, ProfileModel } from '@/domain/common/profile/ProfileModel';
import { EmptyLocationMapped } from '@/domain/common/location/LocationModelMapped';
import { mapProfileModelToUpdateProfileInput } from '@/domain/common/profile/ProfileModelUtils';

export interface SpaceAdminAboutPageProps extends SettingsPageProps {
  spaceId: string;
  useL0Layout: boolean;
}

const SpaceAdminAboutPage: FC<SpaceAdminAboutPageProps> = ({ useL0Layout, spaceId, routePrefix = '../' }) => {
  const notify = useNotification();
  const { t } = useTranslation();
  const { data: spaceData } = useSpaceAboutDetailsQuery({
    variables: {
      spaceId,
    },
    skip: !spaceId,
  });
  const [updateSpace, { loading }] = useUpdateSpaceMutation({
    onCompleted: () => onSuccess('Successfully updated'),
  });

  const onSuccess = (message: string) => {
    notify(message, 'success');
  };

  const onSubmit = async (values: ProfileFormValues) => {
    updateSpace({
      variables: {
        input: {
          about: {
            profile: mapProfileModelToUpdateProfileInput({
              ...values,
            }),
          },
          ID: spaceId,
        },
      },
    });
  };
  const space = spaceData?.lookup.space;
  const visuals = compact([space?.about.profile.avatar, space?.about.profile.cardBanner, space?.about.profile.banner]);

  const location = formatLocation(space?.about.profile.location) || EmptyLocationMapped;
  const profileModel: ProfileModel = {
    ...(space?.about.profile ?? EmptyProfileModel),
    location,
  };

  let submitWired;
  return (
    <LayoutSwitcher currentTab={SettingsSection.About} tabRoutePrefix={routePrefix} useL0Layout={useL0Layout}>
      <PageContentColumn columns={12}>
        <PageContentBlock>
          <PageContentBlockHeader title={t('components.editSpaceForm.about')} />
          <ProfileForm profile={profileModel} onSubmit={onSubmit} wireSubmit={submit => (submitWired = submit)} />
          <Actions justifyContent={'flex-end'}>
            <SaveButton loading={loading} onClick={() => submitWired()} />
          </Actions>
        </PageContentBlock>
        <PageContentBlock>
          <PageContentBlockHeader title={t('common.description')} />
          <SpaceAboutView />
        </PageContentBlock>
        <PageContentBlock>
          <PageContentBlockHeader title={t('common.visuals')} />
          <EditVisualsView
            visuals={visuals}
            visualTypes={space?.level === SpaceLevel.L0 ? undefined : [VisualType.Avatar, VisualType.Card]}
          />
        </PageContentBlock>
      </PageContentColumn>
    </LayoutSwitcher>
  );
};

export default SpaceAdminAboutPage;
