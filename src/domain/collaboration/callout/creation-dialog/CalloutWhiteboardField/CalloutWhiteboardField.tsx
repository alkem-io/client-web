import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { Caption } from '../../../../../core/ui/typography/components';
import { Box } from '@mui/material';
import FormikWhiteboardPreview from '../../../../platform/admin/templates/WhiteboardTemplates/FormikWhiteboardPreview';
import { gutters } from '../../../../../core/ui/grid/utils';
import { CreateProfileInput } from '../../../../../core/apollo/generated/graphql-schema';

interface CalloutWhiteboardFieldProps {
  name: string;
}

export interface WhiteboardFieldSubmittedValues {
  value: string;
  visualUri?: string;
  profileData: CreateProfileInput;
  tags?: string[];
}

export const CalloutWhiteboardField: FC<CalloutWhiteboardFieldProps> = ({ name }) => {
  const { t } = useTranslation();
  const [, , helpers] = useField<WhiteboardFieldSubmittedValues>(name);

  const handleChange = (newValue: string) => {
    helpers.setValue({
      profileData: {
        displayName: t('components.callout-creation.custom-template'),
      },
      value: newValue,
    });
  };

  return (
    <>
      <Box display="flex" alignItems="center">
        <Box>
          <Caption>{t('components.callout-creation.whiteboard.title')}</Caption>
        </Box>
      </Box>
      <FormikWhiteboardPreview
        name={`${name}.value`}
        canEdit
        onChangeValue={handleChange}
        maxHeight={gutters(12)}
        dialogProps={{ title: t('components.callout-creation.whiteboard-field-dialog.title') }}
      />
    </>
  );
};

export default CalloutWhiteboardField;
