import React, { FC, useCallback } from 'react';
import { useApolloErrorHandler } from '../../hooks';
import {
  useBeginAlkemioUserCredentialOfferInteractionMutation,
  useBeginCommunityMemberCredentialOfferInteractionMutation,
  useBeginCredentialRequestInteractionMutation,
  useGetSupportedCredentialMetadataQuery,
  useUserQuery,
} from '../../hooks/generated/graphql';
import { ContainerProps } from '../../models/container';
import {
  BeginCredentialOfferOutput,
  BeginCredentialRequestOutput,
  CredentialMetadataOutput,
  VerifiedCredential,
} from '../../models/graphql-schema';

interface UserCredentialsContainerEntities {
  credentialMetadata: CredentialMetadataOutput[] | undefined;
  verifiedCredentials: VerifiedCredential[] | undefined;
}

interface UserCredentialsContainerState {
  getUserCredentialsLoading: boolean;
  getCredentialMetadataLoading: boolean;
  generateAlkemioUserCredentialOfferLoading: boolean;
  generateCommunityMemberCredentialOfferLoading: boolean;
  generateCredentialRequestLoading: boolean;
}

interface UserCredentialsContainerActions {
  generateAlkemioUserCredentialOffer(): Promise<BeginCredentialOfferOutput>;
  generateCommunityMemberCredentialOffer(communityID: string): Promise<BeginCredentialOfferOutput>;
  generateCredentialRequest(credential: CredentialMetadataOutput): Promise<BeginCredentialRequestOutput>;
}

interface UserCredentialsContainerProps
  extends ContainerProps<
    UserCredentialsContainerEntities,
    UserCredentialsContainerActions,
    UserCredentialsContainerState
  > {
  userID: string;
}

export const UserCredentialsContainer: FC<UserCredentialsContainerProps> = ({ children, userID }) => {
  const handleError = useApolloErrorHandler();

  const { data: userData, loading: getUserCredentialsLoading } = useUserQuery({
    variables: {
      id: userID,
    },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });
  const verifiedCredentials = userData?.user?.agent?.verifiedCredentials;

  const { data: credentialMetadata, loading: getCredentialMetadataLoading } = useGetSupportedCredentialMetadataQuery();
  const [_generateAlkemioUserCredentialOffer, { loading: generateAlkemioUserCredentialOfferLoading }] =
    useBeginAlkemioUserCredentialOfferInteractionMutation({
      fetchPolicy: 'no-cache',
      onError: handleError,
    });

  const generateAlkemioUserCredentialOffer = useCallback(async () => {
    const response = await _generateAlkemioUserCredentialOffer({});
    const data = response.data?.beginAlkemioUserCredentialOfferInteraction;

    if (!data) {
      throw new Error('Could not beginAlkemioUserCredentialOfferInteraction');
    }

    return data;
  }, [_generateAlkemioUserCredentialOffer]);

  const [_generateCommunityMemberCredentialOffer, { loading: generateCommunityMemberCredentialOfferLoading }] =
    useBeginCommunityMemberCredentialOfferInteractionMutation({
      fetchPolicy: 'no-cache',
      onError: handleError,
    });

  const generateCommunityMemberCredentialOffer = useCallback(
    async (communityID: string) => {
      const response = await _generateCommunityMemberCredentialOffer({ variables: { communityID } });
      const data = response.data?.beginCommunityMemberCredentialOfferInteraction;

      if (!data) {
        throw new Error('Could not beginCommunityMemberCredentialOfferInteraction');
      }

      return data;
    },
    [_generateCommunityMemberCredentialOffer]
  );

  const [_generateCredentialRequest, { loading: generateCredentialRequestLoading }] =
    useBeginCredentialRequestInteractionMutation({
      fetchPolicy: 'no-cache',
      onError: handleError,
    });

  const generateCredentialRequest = useCallback(
    async (credential: CredentialMetadataOutput) => {
      const response = await _generateCredentialRequest({ variables: { types: [credential.uniqueType] } });
      const data = response.data?.beginCredentialRequestInteraction;

      if (!data) {
        throw new Error('Could not beginCredentialRequestInteraction');
      }

      return data;
    },
    [_generateCommunityMemberCredentialOffer]
  );

  return (
    <>
      {children(
        {
          credentialMetadata: credentialMetadata?.getSupportedCredentialMetadata,
          verifiedCredentials,
        },
        {
          getUserCredentialsLoading,
          getCredentialMetadataLoading,
          generateAlkemioUserCredentialOfferLoading,
          generateCommunityMemberCredentialOfferLoading,
          generateCredentialRequestLoading,
        },
        {
          generateAlkemioUserCredentialOffer,
          generateCommunityMemberCredentialOffer,
          generateCredentialRequest,
        }
      )}
    </>
  );
};
export default UserCredentialsContainer;
