import { usePendingInvitationsQuery } from '@/core/apollo/generated/apollo-hooks';
import useNavigate from '@/core/routing/useNavigate';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import InvitationActionsContainer from '@/domain/community/invitations/InvitationActionsContainer';
import SingleInvitationFull from '@/domain/community/invitations/SingleInvitationFull';
import { usePendingInvitationsCount } from '@/domain/community/pendingMembership/usePendingInvitationsCount';

export const InvitationsBlock = () => {
  const { count } = usePendingInvitationsCount();
  const { data } = usePendingInvitationsQuery({ skip: count === 0 });
  const navigate = useNavigate();

  const communityInvitations = data?.me.communityInvitations ?? [];

  const onInvitationAccept = (spaceUrl: string) => {
    navigate(spaceUrl);
  };

  if (!communityInvitations.length) {
    return null;
  }

  return (
    <PageContentBlock columns={12}>
      {communityInvitations.map(invitation => (
        <InvitationActionsContainer
          key={invitation.id}
          onAccept={onInvitationAccept}
          spaceId={invitation.spacePendingMembershipInfo.id}
        >
          {props => <SingleInvitationFull invitation={invitation} {...props} />}
        </InvitationActionsContainer>
      ))}
    </PageContentBlock>
  );
};
