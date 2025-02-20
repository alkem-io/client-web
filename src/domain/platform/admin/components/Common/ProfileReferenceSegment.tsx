import { PushFunc, RemoveFunc, useEditReference } from '@/domain/common/reference/useEditReference';
import { Reference } from '@/domain/common/profile/Profile';
import { newReferenceName } from '@/domain/common/reference/newReferenceName';
import ReferenceSegment, { ReferenceSegmentProps } from './ReferenceSegment';
import { useTranslation } from 'react-i18next';

interface ProfileReferenceSegmentProps extends ReferenceSegmentProps {
  profileId?: string;
  onAddCb?: () => void; // Added for additional flexibility in the add handler without affecting the actual add.
  onRemoveCb?: () => void; // Added for additional flexibility in the remove handler without affecting the actual remove.
}

export const ProfileReferenceSegment = ({
  profileId,
  readOnly,
  onAddCb,
  onRemoveCb,
  ...rest
}: ProfileReferenceSegmentProps) => {
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

      onAddCb?.();
    }
  };

  // TODO REMOVE CALLBACK FROM SIGNATURE!
  const handleRemove = async (ref: Reference, removeFn: RemoveFunc) => {
    setRemove(removeFn);
    if (ref.id) {
      deleteReference(ref.id);
      onRemoveCb?.();
    }
  };

  return <ReferenceSegment onAdd={handleAdd} onRemove={handleRemove} readOnly={!profileId || readOnly} {...rest} />;
};

export default ProfileReferenceSegment;
