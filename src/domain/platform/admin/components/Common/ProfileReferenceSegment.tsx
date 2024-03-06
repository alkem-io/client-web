import React, { FC } from 'react';
import { PushFunc, RemoveFunc, useEditReference } from '../../../../common/reference/useEditReference';
import { Reference } from '../../../../common/profile/Profile';
import { newReferenceName } from '../../../../common/reference/newReferenceName';
import ReferenceSegment, { ReferenceSegmentProps } from './ReferenceSegment';
import { useTranslation } from 'react-i18next';

interface ProfileReferenceSegmentProps extends ReferenceSegmentProps {
  profileId?: string;
}

export const ProfileReferenceSegment: FC<ProfileReferenceSegmentProps> = ({ profileId, readOnly, ...rest }) => {
  const { t } = useTranslation();
  const { addReference, deleteReference, setPush, setRemove } = useEditReference();

  // TODO REMOVE CALLBACK FROM SIGNATURE!
  const handleAdd = async (push: PushFunc) => {
    setPush(push);
    if (profileId) {
      addReference({
        profileId,
        name: newReferenceName(t, rest.references.length),
        description: '',
        uri: '',
      });
    }
  };

  // TODO REMOVE CALLBACK FROM SIGNATURE!
  const handleRemove = async (ref: Reference, removeFn: RemoveFunc) => {
    setRemove(removeFn);
    if (ref.id) {
      deleteReference(ref.id);
    }
  };

  return <ReferenceSegment onAdd={handleAdd} onRemove={handleRemove} readOnly={!profileId || readOnly} {...rest} />;
};

export default ProfileReferenceSegment;
