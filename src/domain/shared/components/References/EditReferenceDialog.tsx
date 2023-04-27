import { FC, ReactNode, useMemo } from 'react';
import { CalloutType, Reference } from '../../../../core/apollo/generated/graphql-schema';
import { Box, Button, Dialog, DialogContent, IconButton } from '@mui/material';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import FormikInputField from '../../../../common/components/composite/forms/FormikInputField';
import { Formik } from 'formik';
import * as yup from 'yup';
import { referenceSegmentValidationObject } from '../../../platform/admin/components/Common/ReferenceSegment';
import { BlockSectionTitle, BlockTitle } from '../../../../core/ui/typography';
import calloutIcons from '../../../collaboration/callout/utils/calloutIcons';
import { Actions } from '../../../../core/ui/actions/Actions';
import { gutters } from '../../../../core/ui/grid/utils';
import DeleteIcon from '@mui/icons-material/Delete';

export interface EditReferenceFormValues {
  reference: Pick<Reference, 'id' | 'name' | 'uri' | 'description'>;
}

interface EditReferenceDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  reference: EditReferenceFormValues['reference'];
  onSave: (values: EditReferenceFormValues) => Promise<void>;
  canDelete?: boolean;
  onDelete: () => void;
}

const EditReferenceDialog: FC<EditReferenceDialogProps> = ({
  open,
  onClose,
  title,
  reference,
  onSave,
  canDelete,
  onDelete,
}) => {
  const { t } = useTranslation();
  const breakpoint = useCurrentBreakpoint();
  const isMobile = ['xs', 'sm'].includes(breakpoint);

  const CalloutIcon = calloutIcons[CalloutType.LinkCollection];

  const initialValues: EditReferenceFormValues = useMemo(() => ({ reference }), [reference]);

  const validationSchema = yup.object().shape({
    reference: referenceSegmentValidationObject,
  });

  return (
    <Dialog open={open} aria-labelledby="reference-edit" fullWidth maxWidth="lg">
      <DialogHeader onClose={onClose}>
        <Box display="flex" alignItems="center">
          <CalloutIcon sx={{ marginRight: theme => theme.spacing(1) }} />
          <BlockTitle>{title}</BlockTitle>
        </Box>
      </DialogHeader>
      <DialogContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          validateOnMount
          onSubmit={() => {}}
        >
          {formikState => {
            const { values } = formikState;

            return (
              <>
                <Gutters>
                  <Gutters row={!isMobile} disablePadding alignItems="start">
                    <FormikInputField name={'reference.name'} title={t('common.title')} fullWidth={isMobile} />
                    <Box flexGrow={1} width={isMobile ? '100%' : undefined}>
                      <FormikInputField
                        name={'reference.uri'}
                        title={t('common.url')}
                        attachFile
                        sx={{ flexGrow: 1 }}
                      />
                    </Box>
                  </Gutters>
                  <Box>
                    <FormikInputField name={'reference.description'} title={'Description'} />
                  </Box>
                </Gutters>
                {canDelete && (
                  <Box display="flex" justifyContent="start" padding={gutters()}>
                    <BlockSectionTitle>
                      <IconButton onClick={onDelete} color="error">
                        <DeleteIcon />
                      </IconButton>
                      {t('callout.link-collection.delete-link')}
                    </BlockSectionTitle>
                  </Box>
                )}
                <Actions paddingX={gutters()} justifyContent="space-between">
                  <Button onClick={onClose}>{t('buttons.cancel')}</Button>
                  <Button variant="contained" onClick={() => onSave(values)}>
                    {t('buttons.save')}
                  </Button>
                </Actions>
              </>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default EditReferenceDialog;
