import { PropsWithChildren, ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AssociatedOrganizationsView from '@/domain/community/contributor/organization/AssociatedOrganizations/AssociatedOrganizationsView';
import { useUserContext } from '@/domain/community/user';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { SvgIconProps } from '@mui/material';
import DashboardLeads from './DashboardLeads';
import ContributorCardHorizontal, { ContributorCardHorizontalProps } from '@/core/ui/card/ContributorCardHorizontal';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import { ContributorViewProps } from '../EntityDashboardContributorsSection/Types';

const OrganizationCardTransparent = (props: ContributorCardHorizontalProps) => <ContributorCardHorizontal {...props} />;

const ContributorCard = ({ contributor }: { contributor: ContributorCardHorizontalProps }) => (
  <ContributorCardHorizontal {...contributor} />
);

interface EntityDashboardLeadsProps {
  leadUsers: ContributorViewProps[] | undefined;
  leadOrganizations: ContributorViewProps[] | undefined;
  provider?: ContributorViewProps;
  organizationsHeader: string;
  organizationsHeaderIcon?: ReactElement<SvgIconProps>;
  usersHeader?: string;
}

const EntityDashboardLeadsSection = ({
  usersHeader,
  leadOrganizations,
  leadUsers,
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
      id: user.id,
      profile: user.profile,
      seamless: true,
      onContact: () => {
        sendMessage('user', {
          id: user.id,
          avatarUri: user.profile.avatar?.uri,
          displayName: user.profile.displayName,
          city: user.profile.location?.city,
          country: user.profile.location?.country,
        });
      },
    }));
  }, [leadUsers]);

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
      {children}
      {directMessageDialog}
    </PageContentBlock>
  );
};

export default EntityDashboardLeadsSection;
