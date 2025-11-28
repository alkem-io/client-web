import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, DialogContent, IconButton, Link, Tooltip } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { useTranslation } from 'react-i18next';
import Gutters from '@/core/ui/grid/Gutters';
import { useScreenSize } from '@/core/ui/grid/constants';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { FieldArray, Formik } from 'formik';
import * as yup from 'yup';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { BlockSectionTitle } from '@/core/ui/typography';
import { Actions } from '@/core/ui/actions/Actions';
import { gutters } from '@/core/ui/grid/utils';
import { contributionIcons } from '@/domain/collaboration/callout/icons/calloutIcons';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import FormikFileInput from '@/core/ui/forms/FormikFileInput/FormikFileInput';
import { TranslateWithElements } from '@/domain/shared/i18n/TranslateWithElements';
import { useConfig } from '@/domain/platform/config/useConfig';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import { LONG_TEXT_LENGTH, MID_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { newLinkName } from '@/domain/common/link/newLinkName';
import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import useLoadingState from '../../utils/useLoadingState';
import { v4 as uuid } from 'uuid';
import useDeleteDocument from './useDeleteDocument';

export interface CreateLinkFormValues {
  id: string;
  name: string;
  uri: string;
  description: string;
}

interface FormValueType {
  links: CreateLinkFormValues[];
}

interface CreateLinksDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  onSave: (links: CreateLinkFormValues[]) => Promise<void>;
}

const fieldName = 'links';

export const linkSegmentValidationObject = yup.object().shape({
  name: yup
    .string()
    .required(TranslatedValidatedMessageWithPayload('forms.validations.required'))
    .min(3, ({ min }) => TranslatedValidatedMessageWithPayload('forms.validations.minLength')({ min }))
    .max(SMALL_TEXT_LENGTH, ({ max }) => TranslatedValidatedMessageWithPayload('forms.validations.maxLength')({ max })),
  uri: yup
    .string()
    .max(MID_TEXT_LENGTH, ({ max }) => TranslatedValidatedMessageWithPayload('forms.validations.maxLength')({ max })),
  description: yup
    .string()
    .max(LONG_TEXT_LENGTH, ({ max }) => TranslatedValidatedMessageWithPayload('forms.validations.maxLength')({ max })),
});
export const linkSegmentSchema = yup.array().of(linkSegmentValidationObject);

const isEmptyLinkForm = (links: CreateLinkFormValues[] | undefined): boolean => {
  if (!links || links.length === 0) {
    return true;
  }
  // Form is empty if no link has a URI or description entered
  return links.every(link => !link.uri && !link.description);
};

const CreateLinksDialog = ({ open, onClose, title, onSave }: CreateLinksDialogProps) => {
  const { t } = useTranslation();
  const tLinks = TranslateWithElements(<Link target="_blank" />);
  const { locations } = useConfig();
  const { isMediumSmallScreen } = useScreenSize();

  const CalloutIcon = contributionIcons[CalloutContributionType.Link];
  const [isCancelling, setCancelling] = useState(false);

  // Generate a local ID for new links (not yet on server)
  const generateLocalId = () => `temp-${uuid()}`;

  // Delete uploaded documents when links are removed or dialog is cancelled
  const { deleteDocument, deleteDocuments } = useDeleteDocument();

  const deleteAllUploadedDocuments = useCallback(
    async (links: CreateLinkFormValues[]) => {
      await deleteDocuments(links.map(link => link.uri));
    },
    [deleteDocuments]
  );

  const [handleSave, isSaving] = useLoadingState(async (currentLinks: CreateLinkFormValues[]) => {
    await onSave(currentLinks);
    onClose();
  });

  const initialValues: FormValueType = useMemo(
    () => ({
      links: open
        ? [
            {
              id: generateLocalId(),
              name: newLinkName(t, 0),
              uri: '',
              description: '',
            },
          ]
        : [],
    }),
    [open, t]
  );

  const validationSchema = yup.object().shape({
    links: linkSegmentSchema,
  });

  const [nextLinkId, setNextLinkId] = useState<string>();

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.querySelector(`[data-link="${nextLinkId}"]`)?.scrollIntoView({ behavior: 'smooth' });
  }, [nextLinkId]);

  return (
    <>
      <DialogWithGrid columns={12} open={open} aria-labelledby="link-creation">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          validateOnMount
          onSubmit={() => {}}
        >
          {formikState => {
            const { values, setFieldValue, isValid } = formikState;
            const { links: currentLinks } = values;

            const handleOnClose = () => {
              if (!isEmptyLinkForm(currentLinks)) {
                setCancelling(true);
              } else {
                onClose();
              }
            };

            const handleConfirmCancelling = async () => {
              // Delete all uploaded documents before closing
              await deleteAllUploadedDocuments(currentLinks);
              setCancelling(false);
              onClose();
            };

            const handleAddMore = () => {
              const newId = generateLocalId();

              const newLink: CreateLinkFormValues = {
                id: newId,
                name: newLinkName(t, currentLinks.length),
                uri: '',
                description: '',
              };

              setFieldValue(fieldName, [...currentLinks, newLink]);
              setNextLinkId(newId);
            };

            const handleRemoveLink = async (index: number) => {
              if (currentLinks.length > 1) {
                const removedLink = currentLinks[index];
                // Delete the uploaded document if it exists
                if (removedLink?.uri) {
                  await deleteDocument(removedLink.uri);
                }
                const nextValue = [...currentLinks];
                nextValue.splice(index, 1);
                setFieldValue(fieldName, nextValue);
              }
            };

            return (
              <>
                <DialogHeader id="link-creation" icon={<CalloutIcon />} title={title} onClose={handleOnClose} />
                <DialogContent ref={contentRef}>
                  <FieldArray name={fieldName}>
                    {() =>
                      currentLinks?.map((link, index) => (
                        <Gutters key={link.id} data-reference={link.id}>
                          <Gutters row={!isMediumSmallScreen} disablePadding alignItems="start">
                            <FormikInputField
                              name={`${fieldName}.${index}.name`}
                              title={t('common.title')}
                              fullWidth={isMediumSmallScreen}
                            />
                            <Box flexGrow={1} width={isMediumSmallScreen ? '100%' : undefined}>
                              <Box display="flex">
                                <FormikFileInput
                                  name={`${fieldName}.${index}.uri`}
                                  title={t('common.url')}
                                  fullWidth
                                  temporaryLocation
                                  helperText={tLinks('components.referenceSegment.url-helper-text', {
                                    terms: {
                                      href: locations?.terms,
                                      'aria-label': t('components.referenceSegment.plaintext-helper-text'),
                                    },
                                  })}
                                  onChange={fileName => setFieldValue(`${fieldName}.${index}.name`, fileName)}
                                />
                                <Box>
                                  <Tooltip
                                    title={t('components.referenceSegment.tooltips.remove-reference') || ''}
                                    id={'remove-link'}
                                    placement={'bottom'}
                                  >
                                    <IconButton
                                      aria-label={t('buttons.delete')}
                                      onClick={() => handleRemoveLink(index)}
                                      size="large"
                                      disabled={currentLinks.length <= 1}
                                    >
                                      <DeleteOutlineIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                            </Box>
                          </Gutters>
                          <Gutters disablePadding>
                            <FormikInputField
                              name={`${fieldName}.${index}.description`}
                              title={t('common.description')}
                              multiline
                              rows={3}
                            />
                          </Gutters>
                        </Gutters>
                      ))
                    }
                  </FieldArray>
                </DialogContent>
                <Box display="flex" justifyContent="end" padding={gutters()} paddingBottom={0}>
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
                <Actions padding={gutters()}>
                  <Button onClick={handleOnClose}>{t('buttons.cancel')}</Button>
                  <Button
                    variant="contained"
                    onClick={() => handleSave(currentLinks)}
                    disabled={!isValid}
                    loading={isSaving}
                  >
                    {t('buttons.save')}
                  </Button>
                </Actions>
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
                    confirmButtonTextId: 'buttons.yesClose',
                  }}
                />
              </>
            );
          }}
        </Formik>
      </DialogWithGrid>
    </>
  );
};

export default CreateLinksDialog;
