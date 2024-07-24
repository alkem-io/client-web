import React, { PropsWithChildren, ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EntityDashboardLeads } from '../EntityDashboardContributorsSection/Types';
import AssociatedOrganizationsView from '../../contributor/organization/AssociatedOrganizations/AssociatedOrganizationsView';
import {
  buildOrganizationUrl,
  buildUserProfileUrl,
  buildVirtualContributorUrl,
} from '../../../../main/routing/urlBuilders';
import { useUserContext } from '../../user';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { SvgIconProps } from '@mui/material';
import DashboardLeads from './DashboardLeads';
import ContributorCardHorizontal, {
  SpaceWelcomeSectionContributorProps,
} from '../../../../core/ui/card/ContributorCardHorizontal';
import useDirectMessageDialog from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';

const OrganizationCardTransparent = (props: SpaceWelcomeSectionContributorProps) => (
  <ContributorCardHorizontal {...props} />
);

const ContributorCard = ({ contributor }: { contributor: SpaceWelcomeSectionContributorProps }) => (
  <ContributorCardHorizontal {...contributor} />
);

interface EntityDashboardLeadsProps extends EntityDashboardLeads {
  organizationsHeader: string;
  organizationsHeaderIcon?: ReactElement<SvgIconProps>;
  usersHeader?: string;
}

const EntityDashboardLeadsSection = ({
  leadUsers,
  leadOrganizations,
  leadVirtualContributors,
  usersHeader,
  organizationsHeader,
  organizationsHeaderIcon,
  children,
}: PropsWithChildren<EntityDashboardLeadsProps>) => {
  const { t } = useTranslation();

  const { user } = useUserContext();

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const leadOrganizationsMapped = useMemo(
    () =>
      leadOrganizations?.map(org => ({
        key: org.id,
        id: org.id,
        profile: org.profile,
        url: buildOrganizationUrl(org.nameID),
        seamless: true,
        onContact: () => {
          sendMessage('organization', {
            id: org.id,
            avatarUri: org.profile.avatar?.uri,
            displayName: org.profile.displayName,
            city: org.profile.location?.city,
            country: org.profile.location?.country,
          });
        },
      })),
    [leadOrganizations, user?.user]
  );

  const leadUsersMapped = useMemo(() => {
    return leadUsers?.map(user => ({
      id: user.profile.id,
      profile: user.profile,
      url: buildUserProfileUrl(user.nameID),
      seamless: true,
      onContact: () => {
        sendMessage('user', {
          id: user.profile.id,
          avatarUri: user.profile.avatar?.uri,
          displayName: user.profile.displayName,
          city: user.profile.location?.city,
          country: user.profile.location?.country,
        });
      },
    }));
  }, [leadUsers]);

  const leadVirtualContributorsMapped = useMemo(() => {
    return leadVirtualContributors?.map(vc => ({
      id: vc.id,
      profile: vc.profile,
      url: buildVirtualContributorUrl(vc.nameID),
      seamless: true,
      onContact: () => {
        sendMessage('user', {
          id: vc.id,
          avatarUri: vc.profile.avatar?.uri,
          displayName: vc.profile.displayName,
        });
      },
    }));
  }, [leadVirtualContributors]);

  const leadUsersSectionVisible = !!leadUsersMapped && leadUsersMapped.length > 0;
  const leadOrganizationsSectionVisible = !!leadOrganizationsMapped && leadOrganizationsMapped.length > 0;

  if (!leadUsersSectionVisible && !leadOrganizationsSectionVisible) return null;

  return (
    <PageContentBlock>
      {leadUsersSectionVisible && usersHeader && (
        <DashboardLeads headerText={usersHeader} contributors={leadUsersMapped} CardComponent={ContributorCard} />
      )}
      {leadOrganizationsSectionVisible && organizationsHeader && (
        <>
          <PageContentBlockHeader title={organizationsHeader}>{organizationsHeaderIcon}</PageContentBlockHeader>
          <AssociatedOrganizationsView
            organizations={leadOrganizationsMapped}
            organizationCardComponent={OrganizationCardTransparent}
            entityName={t('community.leading-organizations')}
          />
        </>
      )}
      {leadUsersSectionVisible && usersHeader && (
        <DashboardLeads headerText="" contributors={leadVirtualContributorsMapped} CardComponent={ContributorCard} />
      )}
      {children}
      {directMessageDialog}
    </PageContentBlock>
  );
};

export default EntityDashboardLeadsSection;
