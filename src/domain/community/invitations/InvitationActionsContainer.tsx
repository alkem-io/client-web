import useLoadingState from '../../shared/utils/useLoadingState';
import { refetchUserProviderQuery, useInvitationStateEventMutation } from '../../../core/apollo/generated/apollo-hooks';
import { SimpleContainerProps } from '../../../core/container/SimpleContainer';

interface InvitationActionsContainerProvided {
  updating: boolean;
  acceptInvitation: (invitationId: string) => void;
  accepting: boolean;
  rejectInvitation: (invitationId: string) => void;
  rejecting: boolean;
}

interface InvitationActionsContainerProps extends SimpleContainerProps<InvitationActionsContainerProvided> {
  onUpdate?: () => void;
}

const InvitationActionsContainer = ({ onUpdate, children }: InvitationActionsContainerProps) => {
  const [invitationStateEventMutation] = useInvitationStateEventMutation({
    refetchQueries: [refetchUserProviderQuery()],
  });

  const [updateInvitationState, isUpdatingInvitationState] = useLoadingState(
    async (...args: Parameters<typeof invitationStateEventMutation>) => {
      await invitationStateEventMutation(...args);
      onUpdate?.();
    }
  );

  const [acceptInvitation, isAccepting] = useLoadingState((invitationId: string) =>
    updateInvitationState({
      variables: {
        invitationId,
        eventName: 'ACCEPT',
      },
    })
  );

  const [rejectInvitation, isRejecting] = useLoadingState((invitationId: string) =>
    updateInvitationState({
      variables: {
        invitationId,
        eventName: 'REJECT',
      },
    })
  );

  // TODO Uncomment when hiding an Invitation is available in the API
  // const [hideInvitation, isHiding] = useLoadingState((invitationId: string) =>
  //   deleteInvitation({
  //     variables: {
  //       invitationId,
  //     },
  //   })
  // );

  return (
    <>
      {children({
        updating: isUpdatingInvitationState,
        acceptInvitation,
        accepting: isAccepting,
        rejectInvitation,
        rejecting: isRejecting,
      })}
    </>
  );
};

export default InvitationActionsContainer;
