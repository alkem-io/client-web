import React, { FC } from 'react';
import { useCreateReferenceOnProfileMutation, useDeleteReferenceMutation } from '../../../generated/graphql';
import { useApolloErrorHandler } from '../../../hooks/useApolloErrorHandler';
import { Reference } from '../../../models/Profile';
import { newReferenceName } from '../../../utils/newReferenceName';
import ReferenceSegment, { ReferenceSegmentProps } from './ReferenceSegment';

interface ProfileReferenceSegmentProps extends ReferenceSegmentProps {
  profileId?: string;
}

export const ProfileReferenceSegment: FC<ProfileReferenceSegmentProps> = ({ profileId, readOnly, ...rest }) => {
  const handleError = useApolloErrorHandler();
  const [addReference] = useCreateReferenceOnProfileMutation({
    onError: handleError,
  });

  const [deleteReference] = useDeleteReferenceMutation({
    onError: handleError,
  });

  const handleAdd = async (push: (obj?: any) => void) => {
    if (profileId) {
      try {
        const result = await addReference({
          variables: {
            input: {
              profileID: profileId,
              name: newReferenceName(rest.references.length),
              description: '',
              uri: '',
            },
          },
        });
        push({
          id: result.data?.createReferenceOnProfile.id,
          name: result.data?.createReferenceOnProfile.name,
          uri: result.data?.createReferenceOnProfile.uri,
        });
      } catch {
        push();
      }
    }
  };

  const handleRemove = async (ref: Reference, remove: (success: boolean) => void) => {
    if (ref.id) {
      try {
        const result = await deleteReference({
          variables: {
            input: {
              ID: ref.id,
            },
          },
        });
        remove(!!result);
      } catch {
        remove(false);
      }
    }
  };

  return <ReferenceSegment {...rest} onAdd={handleAdd} onRemove={handleRemove} readOnly={!profileId || readOnly} />;
};
export default ProfileReferenceSegment;
