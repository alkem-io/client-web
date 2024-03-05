import { FC, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import { Box, Button, DialogContent, IconButton, Link, Tooltip } from '@mui/material';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { FieldArray, Formik } from 'formik';
import * as yup from 'yup';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import { Actions } from '../../../../core/ui/actions/Actions';
import { gutters } from '../../../../core/ui/grid/utils';
import calloutIcons from '../../../collaboration/callout/utils/calloutIcons';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';
import FormikFileInput from '../../../../core/ui/forms/FormikFileInput/FormikFileInput';
import { TranslateWithElements } from '../../i18n/TranslateWithElements';
import { useConfig } from '../../../platform/config/useConfig';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { MessageWithPayload } from '../../i18n/ValidationMessageTranslation';
import { LONG_TEXT_LENGTH, MID_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import { newLinkName } from '../../../common/link/newLinkName';

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
  onAddMore: () => Promise<string>;
  onRemove: (linkId: string) => Promise<unknown>;
  onSave: (links: CreateLinkFormValues[]) => Promise<void>;
}

const fieldName = 'links';

export const linkSegmentValidationObject = yup.object().shape({
  name: yup
    .string()
    .required(MessageWithPayload('forms.validations.required'))
    .min(3, MessageWithPayload('forms.validations.minLength'))
    .max(SMALL_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength')),
  uri: yup.string().max(MID_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength')),
  description: yup.string().max(LONG_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength')),
});
export const linkSegmentSchema = yup.array().of(linkSegmentValidationObject);

const CreateLinksDialog: FC<CreateLinksDialogProps> = ({ open, onClose, title, onAddMore, onRemove, onSave }) => {
  const { t } = useTranslation();
  const tLinks = TranslateWithElements(<Link target="_blank" />);
  const { locations } = useConfig();
  const breakpoint = useCurrentBreakpoint();
  const isMobile = ['xs', 'sm'].includes(breakpoint);

  const CalloutIcon = calloutIcons[CalloutType.LinkCollection];
  const [newLinkId, setNewLinkId] = useState<string>();
  const [hangingLinkIds, setHangingLinkIds] = useState<string[]>([]);
  const [isCancelling, setCancelling] = useState(false);

  const handleOnClose = () => setCancelling(true);
  const handleConfirmCancelling = async () => {
    for (const linkId of hangingLinkIds) {
      await onRemove(linkId);
    }
    setHangingLinkIds([]);
    setCancelling(false);
    onClose();
  };

  const handleSave = (currentLinks: CreateLinkFormValues[]) => {
    setHangingLinkIds([]);
    onSave(currentLinks);
  };

  useEffect(() => {
    const run = async () => {
      const newId = await onAddMore();
      setNewLinkId(newId);
      setHangingLinkIds([...hangingLinkIds, newId]);
    };
    if (open) {
      run();
    }
  }, [open]);

  const initialValues: FormValueType = useMemo(
    () => ({
      links: newLinkId
        ? [
            {
              id: newLinkId,
              name: newLinkName(0),
              uri: '',
              description: '',
            },
          ]
        : [],
    }),
    [newLinkId]
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
        <DialogHeader icon={<CalloutIcon />} title={title} onClose={handleOnClose} />
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

            const handleAddMore = async () => {
              const newId = await onAddMore();
              setHangingLinkIds([...hangingLinkIds, newId]);

              const newLink: CreateLinkFormValues = {
                id: newId,
                name: newLinkName(currentLinks.length),
                uri: '',
                description: '',
              };

              setFieldValue(fieldName, [...currentLinks, newLink]);

              setNextLinkId(newId);
            };

            return (
              <>
                <DialogContent ref={contentRef}>
                  <FieldArray name={fieldName}>
                    {() =>
                      currentLinks?.map((link, index) => (
                        <Gutters key={link.id} data-reference={link.id}>
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
                                  entityID={link.id}
                                  entityType={'link'}
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
                                    id={'remove-link'}
                                    placement={'bottom'}
                                  >
                                    <IconButton
                                      aria-label={t('buttons.delete')}
                                      onClick={async () => {
                                        if (currentLinks.length > 1) {
                                          // Remove the temporary link from the server:
                                          await onRemove(link.id);
                                          // Remove the id from the list of pending to confirm links:
                                          const nextHangingLinkIds = [...hangingLinkIds];
                                          nextHangingLinkIds.splice(index, 1);
                                          setHangingLinkIds(nextHangingLinkIds);
                                          // Remove the link from the Formik Field value
                                          const nextValue = [...currentLinks];
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
                <Actions padding={gutters()} justifyContent="space-between">
                  <Button onClick={handleOnClose}>{t('buttons.cancel')}</Button>
                  <Button variant="contained" onClick={() => handleSave(currentLinks)} disabled={!isValid}>
                    {t('buttons.save')}
                  </Button>
                </Actions>
              </>
            );
          }}
        </Formik>
      </DialogWithGrid>
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

export default CreateLinksDialog;
