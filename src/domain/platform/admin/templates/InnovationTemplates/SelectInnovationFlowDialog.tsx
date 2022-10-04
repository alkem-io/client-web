import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog/Dialog';
import { Formik } from 'formik';
import { Box, Button } from '@mui/material';
import * as yup from 'yup';
import { DialogActions, DialogContent, DialogTitle } from '../../../../../common/components/core/dialog';
import PolylineOutlinedIcon from '@mui/icons-material/PolylineOutlined';
import { LifecycleTemplateSegment } from '../../components/Common/LifecycleTemplateSegment';
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
  onSubmit: (formData: SelectInnovationFlowFormValuesType) => void;
}

const SelectInnovationFlowDialog: FC<SelectInnovationFlowDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
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

  let wiredSubmit;

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
              onSubmit(values);
            }}
          >
            {({ values: { innovationFlowTemplateID }, handleSubmit }) => {
              wiredSubmit = handleSubmit;
              const selectedInnovationFlowTemplate = innovationFlowTemplates?.find(
                template => template.id === innovationFlowTemplateID
              );

              return (
                <LifecycleTemplateSegment
                  innovationFlowTemplateOptions={innovationFlowTemplateOptions}
                  definition={selectedInnovationFlowTemplate?.definition || ''}
                  required
                />
              );
            }}
          </Formik>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'end' }}>
        {onClose && (
          <Button onClick={onClose} variant="outlined">
            {t('buttons.cancel')}
          </Button>
        )}
        <Button onClick={() => wiredSubmit()} variant="contained">
          {t('buttons.change')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectInnovationFlowDialog;
