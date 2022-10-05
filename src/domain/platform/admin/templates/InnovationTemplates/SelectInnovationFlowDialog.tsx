import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog/Dialog';
import { Formik } from 'formik';
import { Box, Button } from '@mui/material';
import * as yup from 'yup';
import { DialogActions, DialogContent, DialogTitle } from '../../../../../common/components/core/dialog';
import PolylineOutlinedIcon from '@mui/icons-material/PolylineOutlined';
import { InnovationFlowTemplateSegment } from '../../components/Common/InnovationFlowTemplateSegment';
import { FormikSelectValue } from '../../../../../common/components/composite/forms/FormikSelect';
import { LifecycleType } from '../../../../../models/graphql-schema';

export interface LifecycleTemplateInfo {
  id: string;
  title?: string;
}
export interface LifecycleTemplate {
  definition: string;
  id: string;
  type: LifecycleType;
  info: LifecycleTemplateInfo;
}
export interface SelectInnovationFlowFormValuesType {
  innovationFlowTemplateID: string;
}

export interface SelectInnovationFlowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  innovationFlowTemplates: LifecycleTemplate[] | undefined;
  innovationFlowTemplateID: string;
  onSubmitForm: (formData: SelectInnovationFlowFormValuesType) => void;
  wireSubmit: (setter: () => void) => void;
  onSubmitDialog: () => void;
}

const SelectInnovationFlowDialog: FC<SelectInnovationFlowDialogProps> = ({
  isOpen,
  onClose,
  onSubmitForm,
  wireSubmit,
  onSubmitDialog,
  innovationFlowTemplates,
  innovationFlowTemplateID = '',
}) => {
  const { t } = useTranslation();

  const innovationFlowTemplateOptions = useMemo(
    () =>
      Object.values(innovationFlowTemplates || []).map<FormikSelectValue>(x => ({
        id: x.id,
        name: x.info.title || '',
      })),
    [innovationFlowTemplates]
  );

  const initialValues: SelectInnovationFlowFormValuesType = {
    innovationFlowTemplateID,
  };

  const validationSchema = yup.object().shape({
    innovationFlowTemplateID: yup.string().required(t('forms.validations.required')),
  });

  let isSubmitWired = false;

  return (
    <Dialog open={isOpen} maxWidth="md" fullWidth aria-labelledby="callout-creation-title">
      <DialogTitle id="callout-creation-title" onClose={onClose}>
        <Box display="flex">
          <PolylineOutlinedIcon sx={{ marginRight: 1 }} />
          {t('components.select-innovation-flow.title')}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box paddingY={theme => theme.spacing(2)}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize
            onSubmit={async values => {
              onSubmitForm(values);
            }}
          >
            {({ values: { innovationFlowTemplateID }, handleSubmit }) => {
              if (!isSubmitWired) {
                wireSubmit(handleSubmit);
                isSubmitWired = true;
              }

              const selectedInnovationFlowTemplate = innovationFlowTemplates?.find(
                template => template.id === innovationFlowTemplateID
              );

              return (
                <InnovationFlowTemplateSegment
                  innovationFlowTemplateOptions={innovationFlowTemplateOptions}
                  definition={selectedInnovationFlowTemplate?.definition || ''}
                  required
                />
              );
            }}
          </Formik>
        </Box>
      </DialogContent>
      <DialogActions>
        {onClose && (
          <Button onClick={onClose} sx={{ justifyContent: 'start' }}>
            {t('buttons.cancel')}
          </Button>
        )}
        <Button onClick={onSubmitDialog} variant="contained" sx={{ justifyContent: 'end' }}>
          {t('buttons.change')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectInnovationFlowDialog;
