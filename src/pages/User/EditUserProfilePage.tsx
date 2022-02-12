import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useResolvedPath } from 'react-router-dom';
import QRCodeDialog from '../../components/composite/dialogs/QRCodeDialog/QRCodeDialog';
import { UserForm } from '../../components/composite/forms/UserForm';
import { Loading } from '../../components/core';
import { useApolloErrorHandler, useNotification, useUpdateNavigation, useUrlParams, useUserContext } from '../../hooks';
import {
  useCreateTagsetOnProfileMutation,
  useGenerateCredentialShareRequestLazyQuery,
  useUpdateUserMutation,
  useUserQuery,
} from '../../hooks/generated/graphql';
import { EditMode } from '../../models/editMode';
import { UpdateUserInput, User } from '../../models/graphql-schema';
import { UserModel } from '../../models/User';
import { logger } from '../../services/logging/winston/logger';
import { buildUserProfileUrl } from '../../utils/urlBuilders';
import { PageProps } from '../common';

interface EditUserProfilePageProps extends PageProps {}

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

export const EditUserProfilePage: FC<EditUserProfilePageProps> = ({ paths }) => {
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
  const [createTagset] = useCreateTagsetOnProfileMutation({
    // Just log the error. Do not send it to the notification hanlder.
    // there is an issue handling multiple snackbars.
    onError: error => logger.error(error.message),
  });
  const handleError = useApolloErrorHandler();

  const [updateUser] = useUpdateUserMutation({
    onError: handleError,
    onCompleted: () => {
      notify('User updated successfully', 'success');
    },
  });

  const editMode = useMemo(() => {
    if (data?.user.id === currentUser?.user.id) return EditMode.edit;
    return EditMode.readOnly;
  }, [data, currentUser]);

  const [qrDialogOpen, setQRDialogOpen] = useState(false);
  const [jwt, setJWT] = useState<string | null>(null);
  const [requestedCredentialTypes, setRequestedCredentialTypes] = useState<string[]>([]);
  const [generateCredentialRequest, { loading: generateCredentialRequestLoading }] =
    useGenerateCredentialShareRequestLazyQuery({
      fetchPolicy: 'no-cache',
      onError: handleError,
      onCompleted: data => {
        setJWT(data.generateCredentialShareRequest.jwt);
      },
    });

  if (loading) return <Loading text={'Loading User Profile ...'} />;

  const user = data?.user as User;

  const handleSave = async (userToUpdate: UserModel) => {
    const profileId = userToUpdate.profile.id;
    const tagsetsToAdd = userToUpdate.profile.tagsets.filter(x => !x.id);

    for (const tagset of tagsetsToAdd) {
      await createTagset({
        variables: {
          input: {
            name: tagset.name,
            tags: [...tagset.tags],
            profileID: profileId,
          },
        },
      });
    }

    await updateUser({
      variables: {
        input: getUpdateUserInput(userToUpdate),
      },
    });

    if (currentUser) {
      navigate(buildUserProfileUrl(currentUser.user.nameID), { replace: true });
    }
  };

  return (
    <>
      <UserForm
        title={'Profile'}
        user={{ ...user } as UserModel}
        avatar={user?.profile?.avatar}
        editMode={editMode}
        onSave={handleSave}
        onVerify={async type => {
          setQRDialogOpen(true);
          setRequestedCredentialTypes([type]);
          await generateCredentialRequest({ variables: { types: [type] } });
        }}
      />
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

export default EditUserProfilePage;
