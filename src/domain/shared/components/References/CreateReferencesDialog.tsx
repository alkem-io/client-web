import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { CalloutType, Reference } from '../../../../core/apollo/generated/graphql-schema';
import { Box, Button, Dialog, DialogContent, IconButton, Link, Tooltip } from '@mui/material';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { Formik } from 'formik';
import * as yup from 'yup';
import { referenceSegmentSchema } from '../../../platform/admin/components/Common/ReferenceSegment';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { BlockSectionTitle, BlockTitle } from '../../../../core/ui/typography';
import { Actions } from '../../../../core/ui/actions/Actions';
import { gutters } from '../../../../core/ui/grid/utils';
import calloutIcons from '../../../collaboration/callout/utils/calloutIcons';
import { newReferenceName } from '../../../common/reference/newReferenceName';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';
import FormikFileInput from '../../../../core/ui/forms/FormikFileInput/FormikFileInput';
import { TranslateWithElements } from '../../i18n/TranslateWithElements';
import { useConfig } from '../../../platform/config/useConfig';
import { ReferenceType } from '../../../../core/ui/upload/FileUpload/FileUpload';

export interface CreateReferenceFormValues extends Pick<Reference, 'id' | 'name' | 'uri' | 'description'> {}

interface FormValueType {
  references: CreateReferenceFormValues[];
}

interface CreateReferencesDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  referenceType?: ReferenceType;
  onAddMore: () => Promise<string>;
  onRemove: (referenceId: string) => Promise<unknown>;
  onSave: (references: CreateReferenceFormValues[]) => Promise<void>;
}

const fieldName = 'references';

const CreateReferencesDialog: FC<CreateReferencesDialogProps> = ({
  open,
  onClose,
  title,
  referenceType,
  onAddMore,
  onRemove,
  onSave,
}) => {
  const { t } = useTranslation();
  const tLinks = TranslateWithElements(<Link target="_blank" />);
  const { locations } = useConfig();
  const breakpoint = useCurrentBreakpoint();
  const isMobile = ['xs', 'sm'].includes(breakpoint);

  const CalloutIcon = calloutIcons[CalloutType.LinkCollection];
  const [newReferenceId, setNewReferenceId] = useState<string>();
  const [hangingReferenceIds, setHangingReferenceIds] = useState<string[]>([]);
  const [isCancelling, setCancelling] = useState(false);

  const handleOnClose = () => setCancelling(true);
  const handleConfirmCancelling = async () => {
    for (const referenceId of hangingReferenceIds) {
      await onRemove(referenceId);
    }
    setHangingReferenceIds([]);
    setCancelling(false);
    onClose();
  };

  const handleSave = (currentReferences: CreateReferenceFormValues[]) => {
    setHangingReferenceIds([]);
    onSave(currentReferences);
  };

  useEffect(() => {
    const run = async () => {
      const newId = await onAddMore();
      setNewReferenceId(newId);
      setHangingReferenceIds([...hangingReferenceIds, newId]);
    };
    if (open) {
      run();
    }
  }, [open]);

  const initialValues: FormValueType = useMemo(
    () => ({
      references: newReferenceId
        ? [
            {
              id: newReferenceId,
              name: newReferenceName(0),
              uri: '',
              description: '',
            },
          ]
        : [],
    }),
    [newReferenceId]
  );

  const validationSchema = yup.object().shape({
    references: referenceSegmentSchema,
  });

  return (
    <>
      <Dialog open={open} aria-labelledby="reference-creation" fullWidth maxWidth="lg">
        <DialogHeader onClose={handleOnClose}>
          <Box display="flex" alignItems="center" gap={gutters(0.5)}>
            <CalloutIcon />
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
              const { values, setFieldValue } = formikState;
              const { references: currentReferences } = values;

              const handleAddMore = async () => {
                const newId = await onAddMore();
                setHangingReferenceIds([...hangingReferenceIds, newId]);

                const newReference: CreateReferenceFormValues = {
                  id: newId,
                  name: newReferenceName(currentReferences.length),
                  uri: '',
                  description: '',
                };
                setFieldValue('references', [...currentReferences, newReference]);
              };

              return (
                <>
                  {currentReferences?.map((reference, index) => (
                    <Gutters key={reference.id}>
                      <Gutters row={!isMobile} disablePadding alignItems="start">
                        <FormikInputField
                          name={`${fieldName}.${index}.name`}
                          title={t('common.title')}
                          fullWidth={isMobile}
                        />
                        <Box flexGrow={1} width={isMobile ? '100%' : undefined}>
                          <Box display="flex">
                            <FormikFileInput
                              name={`${fieldName}.${index}.uri`}
                              title={t('common.url')}
                              fullWidth
                              referenceID={reference.id}
                              referenceType={referenceType}
                              helperText={tLinks('components.referenceSegment.url-helper-text', {
                                terms: {
                                  href: locations?.terms,
                                  'aria-label': t('components.referenceSegment.plaintext-helper-text'),
                                },
                              })}
                            />
                            <Box>
                              <Tooltip
                                title={t('components.referenceSegment.tooltips.remove-reference') || ''}
                                id={'remove a reference'}
                                placement={'bottom'}
                              >
                                <IconButton
                                  aria-label={t('buttons.delete')}
                                  onClick={async () => {
                                    if (currentReferences.length > 1) {
                                      // Remove the temporary reference from the server:
                                      await onRemove(reference.id);
                                      // Remove the id from the list of pending to confirm references:
                                      const nextHangingReferenceIds = [...hangingReferenceIds];
                                      nextHangingReferenceIds.splice(index, 1);
                                      setHangingReferenceIds(nextHangingReferenceIds);
                                      // Remove the reference from the Formik Field value
                                      const nextValue = [...currentReferences];
                                      nextValue.splice(index, 1);
                                      setFieldValue(fieldName, nextValue);
                                    }
                                  }}
                                  size="large"
                                >
                                  <DeleteOutlineIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </Box>
                      </Gutters>
                      <Box>
                        <FormikInputField name={`${fieldName}.${index}.description`} title={'Description'} />
                      </Box>
                    </Gutters>
                  ))}
                  <Box display="flex" justifyContent="end" padding={gutters()}>
                    <BlockSectionTitle>
                      {t('callout.link-collection.add-another')}
                      <IconButton
                        onClick={handleAddMore}
                        color="primary"
                        aria-label={t('callout.link-collection.add-another')}
                      >
                        <AddIcon />
                      </IconButton>
                    </BlockSectionTitle>
                  </Box>
                  <Actions paddingX={gutters()} justifyContent="space-between">
                    <Button onClick={handleOnClose}>{t('buttons.cancel')}</Button>
                    <Button variant="contained" onClick={() => handleSave(currentReferences)}>
                      {t('buttons.save')}
                    </Button>
                  </Actions>
                </>
              );
            }}
          </Formik>
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        actions={{
          onConfirm: handleConfirmCancelling,
          onCancel: () => setCancelling(false),
        }}
        options={{
          show: isCancelling,
        }}
        entities={{
          titleId: 'callout.link-collection.cancel-confirm-title',
          contentId: 'callout.link-collection.cancel-confirm',
          confirmButtonTextId: 'buttons.confirm',
        }}
      />
    </>
  );
};

export default CreateReferencesDialog;
