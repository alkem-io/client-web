import { useState } from 'react';
import { DescriptionView } from './DescriptionView';
import { DescriptionEditDialog, KnowledgeBaseProfileType } from '@/domain/common/description/DescriptionEditDialog';

type DescriptionComponentProps = {
  description: string | undefined;
  canEdit?: boolean;
  onUpdate: ({ description }: KnowledgeBaseProfileType) => Promise<void>;
};

export const DescriptionComponent = ({ description, canEdit, onUpdate }: DescriptionComponentProps) => {
  const [editOpen, setEditOpen] = useState(false);

  const onEditClick = () => {
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
  };

  const onSave = async ({ description }: KnowledgeBaseProfileType) => {
    await onUpdate({ description });
    closeEdit();
  };

  return (
    <>
      <DescriptionView description={description} canEdit={canEdit} onEditClick={onEditClick} />
      {editOpen && <DescriptionEditDialog description={description} onUpdate={onSave} onClose={closeEdit} />}
    </>
  );
};
