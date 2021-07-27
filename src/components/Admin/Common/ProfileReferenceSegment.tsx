import React, { FC } from 'react';
import { PushFunc, RemoveFunc, useEditReference } from '../../../hooks';
import { Reference } from '../../../models/Profile';
import { newReferenceName } from '../../../utils/newReferenceName';
import ReferenceSegment, { ReferenceSegmentProps } from './ReferenceSegment';

interface ProfileReferenceSegmentProps extends ReferenceSegmentProps {
  profileId?: string;
}

export const ProfileReferenceSegment: FC<ProfileReferenceSegmentProps> = ({ profileId, readOnly, ...rest }) => {
  const { addReference, deleteReference, setPush, setRemove } = useEditReference();

  const handleAdd = async (push: PushFunc) => {
    setPush(push);
    if (profileId) {
      addReference({
        profileId,
        name: newReferenceName(rest.references.length),
        description: '',
        uri: '',
      });
    }
  };

  const handleRemove = async (ref: Reference, removeFn: RemoveFunc) => {
    setRemove(removeFn);
    if (ref.id) {
      deleteReference(ref.id);
    }
  };

  return <ReferenceSegment onAdd={handleAdd} onRemove={handleRemove} readOnly={!profileId || readOnly} {...rest} />;
};
export default ProfileReferenceSegment;
