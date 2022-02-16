import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useResolvedPath } from 'react-router-dom';
import QRCodeDialog from '../../components/composite/dialogs/QRCodeDialog/QRCodeDialog';
import { Loading } from '../../components/core';
import { useApolloErrorHandler, useNotification, useUpdateNavigation, useUrlParams, useUserContext } from '../../hooks';
import { useBeginCredentialRequestInteractionLazyQuery, useUserQuery } from '../../hooks/generated/graphql';
import { UpdateUserInput } from '../../models/graphql-schema';
import { UserModel } from '../../models/User';
import { PageProps } from '../common';

interface UserCredentialsPageProps extends PageProps {}

// TODO [ATS] Need optimization this code is copy paste a few times.
export const getUpdateUserInput = (user: UserModel): UpdateUserInput => {
  const { id: userID, email, memberof, profile, agent, ...rest } = user;

  return {
    ...rest,
    ID: userID,
    profileData: {
      ID: user.profile.id || '',
      description: profile.description,
      references: profile.references.filter(r => r.id).map(t => ({ ID: t.id || '', name: t.name, uri: t.uri })),
      tagsets: profile.tagsets.filter(t => t.id).map(t => ({ ID: t.id || '', name: t.name, tags: [...t.tags] })),
    },
  };
};

export const UserCredentialsPage: FC<UserCredentialsPageProps> = ({ paths }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userId = '' } = useUrlParams();
  const { pathname: url } = useResolvedPath('.');

  const { user: currentUser } = useUserContext();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'profile', real: true }], [url, paths]);
  useUpdateNavigation({ currentPaths });

  const { data, loading } = useUserQuery({
    variables: {
      id: userId,
    },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });
  const notify = useNotification();
  const handleError = useApolloErrorHandler();

  const [qrDialogOpen, setQRDialogOpen] = useState(false);
  const [jwt, setJWT] = useState<string | null>(null);
  const [requestedCredentialTypes, setRequestedCredentialTypes] = useState<string[]>([]);
  const [generateCredentialRequest, { loading: generateCredentialRequestLoading }] =
    useBeginCredentialRequestInteractionLazyQuery({
      fetchPolicy: 'no-cache',
      onError: handleError,
      onCompleted: data => {
        setJWT(data.beginCredentialRequestInteraction.jwt);
      },
    });

  if (loading) return <Loading text={'Loading User Profile ...'} />;

  return (
    <>
      <QRCodeDialog
        actions={{
          onCancel: () => setQRDialogOpen(false),
        }}
        entities={{
          qrValue: jwt,
          titleId: 'components.credential-share-request-dialog.title',
          content: t('components.credential-share-request-dialog.content', {
            credentials: requestedCredentialTypes.join(','),
          }),
        }}
        options={{
          show: qrDialogOpen,
        }}
        state={{
          isLoading: generateCredentialRequestLoading,
        }}
      />
    </>
  );
};

export default UserCredentialsPage;
