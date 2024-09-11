import React, { useEffect, useState } from 'react';
import { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import CreateEditTemplateDialogBase from './CreateEditTemplateDialogBase';
import { TemplateType } from '../../../../../core/apollo/generated/graphql-schema';
import TemplateForm, { AnyTemplateFormSubmittedValues } from '../../Forms/TemplateForm';
import { getNewTemplate } from '../../../models/common';
import { AnyTemplate } from '../../../models/TemplateBase';
import { CircularProgress } from '@mui/material';

interface CreateTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: AnyTemplateFormSubmittedValues) => void;
  templateType: TemplateType;
  getDefaultValues?: () => Promise<Partial<AnyTemplate>>;
}

const CreateTemplateDialog = ({
  templateType,
  open,
  onClose,
  getDefaultValues,
  onSubmit,
}: CreateTemplateDialogProps) => {
  const [defaultValues, setDefaultValues] = useState<AnyTemplate | undefined>();
  useEffect(() => {
    (async () => {
      if (open) {
        if (getDefaultValues) {
          setDefaultValues(getNewTemplate(templateType, await getDefaultValues()));
        } else {
          setDefaultValues(getNewTemplate(templateType));
        }
      }
    })();
  }, [open]);

  return (
    <CreateEditTemplateDialogBase open={open} onClose={onClose} templateType={templateType}>
      {({ actions }) => (
        <>
          {!defaultValues && <CircularProgress />}
          {defaultValues && <TemplateForm template={defaultValues} onSubmit={onSubmit} actions={actions} />}
        </>
      )}
    </CreateEditTemplateDialogBase>
  );
};

export default CreateTemplateDialog;
