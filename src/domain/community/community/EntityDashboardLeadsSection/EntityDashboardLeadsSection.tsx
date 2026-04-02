import type { SvgIconProps } from '@mui/material';
import type { PropsWithChildren, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileType } from '@/core/apollo/generated/graphql-schema';
import ContributorCardHorizontal, {
  type ContributorCardHorizontalProps,
} from '@/core/ui/card/ContributorCardHorizontal';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import AssociatedOrganizationsView from '@/domain/community/organization/AssociatedOrganizations/AssociatedOrganizationsView';
import type { ContributorViewModel } from '../utils/ContributorViewModel';
import DashboardLeads from './DashboardLeads';

const OrganizationCardTransparent = (props: ContributorCardHorizontalProps) => <ContributorCardHorizontal {...props} />;

const ContributorCard = ({ contributor }: { contributor: ContributorCardHorizontalProps }) => (
  <ContributorCardHorizontal {...contributor} />
);

interface EntityDashboardLeadsProps {
  leadUsers: ContributorViewModel[] | undefined;
  leadOrganizations: ContributorViewModel[] | undefined;
  provider?: ContributorViewModel;
  organizationsHeader?: string;
  organizationsHeaderIcon?: ReactElement<SvgIconProps>;
  usersHeader?: string;
}

export const getMessageType = (type: ProfileType | undefined) => (type === ProfileType.User ? 'user' : 'organization');

const EntityDashboardLeadsSection = ({
  usersHeader,
  leadOrganizations,
  leadUsers,
  organizationsHeader,
  organizationsHeaderIcon,
  children,
}: PropsWithChildren<EntityDashboardLeadsProps>) => {
  const { t } = useTranslation();

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const leadOrganizationsMapped = leadOrganizations?.map(org => ({
    id: org.id,
    profile: org.profile,
    seamless: true,
    onContact: () => {
      sendMessage(getMessageType(ProfileType.Organization), {
        id: org.id,
        avatarUri: org.profile?.avatar?.uri,
        displayName: org.profile?.displayName,
        city: org.profile?.location?.city,
        country: org.profile?.location?.country,
      });
    },
  }));

  const leadUsersMapped = (() => {
    return leadUsers?.map(user => ({
      id: user.id,
      profile: user.profile,
      seamless: true,
      onContact: () => {
        sendMessage(getMessageType(ProfileType.User), {
          id: user.id,
          avatarUri: user.profile?.avatar?.uri,
          displayName: user.profile?.displayName,
          city: user.profile?.location?.city,
          country: user.profile?.location?.country,
        });
      },
    }));
  })();

  const leadUsersSectionVisible = !!leadUsersMapped && leadUsersMapped.length > 0;
  const leadOrganizationsSectionVisible = !!leadOrganizationsMapped && leadOrganizationsMapped.length > 0;

  if (!leadUsersSectionVisible && !leadOrganizationsSectionVisible) return null;

  return (
    <PageContentBlock>
      {leadUsersSectionVisible && usersHeader && (
        <DashboardLeads headerText={usersHeader} contributors={leadUsersMapped} CardComponent={ContributorCard} />
      )}
      {leadOrganizationsSectionVisible && (
        <>
          {organizationsHeader && (
            <PageContentBlockHeader title={organizationsHeader}>{organizationsHeaderIcon}</PageContentBlockHeader>
          )}
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
