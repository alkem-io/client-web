import React, { PropsWithChildren, useMemo } from 'react';
import TopLevelDesktopLayout from '../../../../main/ui/layout/TopLevelDesktopLayout';
import TopLevelPageBreadcrumbs from '../../../../main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { AssignmentIndOutlined } from '@mui/icons-material';
import { Identifiable } from '../../../../core/utils/Identifiable';
import ProfilePageBanner, { ProfilePageBannerProps } from '../../../common/profile/ProfilePageBanner';
import { buildInnovationPackSettingsUrl, buildInnovationPackUrl } from '../urlBuilders';
import { Visual } from '../../../common/visual/Visual';

interface InnovationPackProfileLayoutProps {
  innovationPack:
    | (Identifiable & {
        nameID: string;
        profile: ProfilePageBannerProps['profile'];
        provider?: {
          profile: {
            displayName: string;
            avatar?: Visual;
          };
        };
      })
    | undefined;
  showSettings: boolean;
  loading?: boolean;
}

const InnovationPackProfileLayout = ({
  innovationPack,
  showSettings,
  loading,
  ...props
}: PropsWithChildren<InnovationPackProfileLayoutProps>) => {
  const profile = useMemo(() => {
    return {
      ...innovationPack?.profile,
      tagline: innovationPack?.provider?.profile.displayName,
      avatar: innovationPack?.provider?.profile.avatar,
    } as ProfilePageBannerProps['profile'];
  }, [innovationPack]);

  return (
    <TopLevelDesktopLayout
      breadcrumbs={
        <TopLevelPageBreadcrumbs
          loading={loading}
          iconComponent={AssignmentIndOutlined}
          uri={innovationPack?.nameID ? buildInnovationPackUrl(innovationPack?.nameID) : ''}
        >
          {innovationPack?.profile?.displayName}
        </TopLevelPageBreadcrumbs>
      }
      header={
        <ProfilePageBanner
          entityId={innovationPack?.id}
          profile={profile}
          loading={loading}
          settingsUri={
            showSettings && innovationPack?.nameID ? buildInnovationPackSettingsUrl(innovationPack?.nameID) : undefined
          }
        />
      }
      {...props}
    />
  );
};

export default InnovationPackProfileLayout;
