import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { newReferenceName } from '@/domain/common/reference/newReferenceName';
import type { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { type PushFunc, type RemoveFunc, useEditReference } from '@/domain/common/reference/useEditReference';
import ReferenceSegment, { type ReferenceSegmentProps } from './ReferenceSegment';

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
  const handleRemove = async (ref: ReferenceModel, removeFn: RemoveFunc) => {
    setRemove(removeFn);
    if (ref.id) {
      deleteReference(ref.id);
    }
  };

  return <ReferenceSegment onAdd={handleAdd} onRemove={handleRemove} readOnly={!profileId || readOnly} {...rest} />;
};

export default ProfileReferenceSegment;
