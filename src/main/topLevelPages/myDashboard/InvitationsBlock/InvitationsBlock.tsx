import SingleInvitationFull from '@/domain/community/invitations/SingleInvitationFull';
import InvitationActionsContainer from '@/domain/community/invitations/InvitationActionsContainer';
import { usePendingInvitationsQuery } from '@/core/apollo/generated/apollo-hooks';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import useNavigate from '@/core/routing/useNavigate';

export const InvitationsBlock = () => {
  const { data } = usePendingInvitationsQuery();
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
