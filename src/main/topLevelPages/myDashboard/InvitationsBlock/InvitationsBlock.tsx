import { usePendingInvitationsQuery } from '@/core/apollo/generated/apollo-hooks';
import type { PendingInvitationsQuery } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import SingleInvitationFull from '@/domain/community/invitations/SingleInvitationFull';
import useInvitationActions from '@/domain/community/invitations/useInvitationActions';
import { usePendingInvitationsCount } from '@/domain/community/pendingMembership/usePendingInvitationsCount';

type CommunityInvitation = PendingInvitationsQuery['me']['communityInvitations'][number];

const InvitationItem = ({ invitation }: { invitation: CommunityInvitation }) => {
  const navigate = useNavigate();

  const onInvitationAccept = (spaceUrl: string) => {
    navigate(spaceUrl);
  };

  const props = useInvitationActions({
    onAccept: onInvitationAccept,
    spaceId: invitation.spacePendingMembershipInfo.id,
  });

  return <SingleInvitationFull invitation={invitation} {...props} />;
};

export const InvitationsBlock = () => {
  const { count } = usePendingInvitationsCount();
  const { data } = usePendingInvitationsQuery({ skip: count === 0 });

  const communityInvitations = data?.me.communityInvitations ?? [];

  if (!communityInvitations.length) {
    return null;
  }

  return (
    <PageContentBlock columns={12}>
      {communityInvitations.map(invitation => (
        <InvitationItem key={invitation.id} invitation={invitation} />
      ))}
    </PageContentBlock>
  );
};
