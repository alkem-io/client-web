import { useMemo } from 'react';
import SingleInvitationFull from '../../../../domain/community/invitations/SingleInvitationFull';
import InvitationActionsContainer from '../../../../domain/community/invitations/InvitationActionsContainer';
import { InvitationItem } from '../../../../domain/community/user/providers/UserProvider/InvitationItem';
import { usePendingInvitationsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';

export const InvitationsBlock = () => {
  const { data, refetch: refetchPendingInvitationsQuery } = usePendingInvitationsQuery();

  const communityInvitations = useMemo(
    () =>
      data?.me.communityInvitations.map(
        invitation =>
          ({
            type: 0,
            ...(invitation as InvitationItem),
          } as const)
      ) ?? [],
    [data?.me.communityInvitations]
  );

  const onInvitationAccept = () => {
    refetchPendingInvitationsQuery();
  };

  const onInvitationReject = () => {
    refetchPendingInvitationsQuery();
  };

  if (!communityInvitations.length) {
    return null;
  }

  return (
    <PageContentBlock columns={12}>
      {communityInvitations.map(invitation => (
        <InvitationActionsContainer key={invitation.id} onAccept={onInvitationAccept} onReject={onInvitationReject}>
          {props => <SingleInvitationFull invitation={invitation} {...props} />}
        </InvitationActionsContainer>
      ))}
    </PageContentBlock>
  );
};
