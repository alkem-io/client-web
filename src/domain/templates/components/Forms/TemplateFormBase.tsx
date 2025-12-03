import React, { ReactNode, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { TagsetField } from '@/domain/platformAdmin/components/Common/TagsetSegment';
import VisualUpload from '@/core/ui/upload/VisualUpload/VisualUpload';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { TemplateType, Visual } from '@/core/apollo/generated/graphql-schema';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import GridContainer from '@/core/ui/grid/GridContainer';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import { Box } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import BlockSectionTitleWithIcon from '@/core/ui/content/BlockSectionTitleWithIcon';
import { gutters } from '@/core/ui/grid/utils';
import { BlockSectionTitle } from '@/core/ui/typography';
import { AnyTemplate } from '@/domain/templates/models/TemplateBase';
import { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';
import { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import { TemplateFormActions } from '../Dialogs/CreateEditTemplateDialog/CreateEditTemplateDialogBase';

/**
 * Whiteboards have preview imagesTemplates, they are handled separately and uploaded as the Visual of the Template
 */
export interface TemplateFormWithPreviewImages {
  whiteboardPreviewImages?: WhiteboardPreviewImage[];
}

export interface TemplateFormProfileSubmittedValues {
  profile: {
    // Match CreateProfileInput | UpdateProfileInput;
    displayName?: string;
    description?: string;
    // On CreateProfileInput tags need to be one level higher, and tagsets need to be removed from here.
    // On UpdateProfileInput tagsets need to be here and the id needs to be passed
    tagsets?: {
      ID: string;
      tags: string[];
    }[];
    // On CreateProfileInput is called referencesData and id needs to be removed
    // On UpdateProfileInput it's references need to be here and the ids need to be passed
    references?: {
      ID: string;
      description?: string;
      name?: string;
      uri?: string;
    }[];
  };
}

interface TemplateFormBaseProps<T extends TemplateFormProfileSubmittedValues> {
  templateType: TemplateType;
  template?: AnyTemplate;
  initialValues: T;
  onSubmit: (values: T, formikHelpers: FormikHelpers<T>) => void;
  actions: TemplateFormActions<T>;
  children?: ReactNode | ((formState: FormikProps<T>) => ReactNode);
  validator?: yup.ObjectShape;
}

const TemplateFormBase = <T extends TemplateFormProfileSubmittedValues>({
  template,
  initialValues,
  onSubmit,
  actions,
  children,
  validator,
  templateType,
}: TemplateFormBaseProps<T>) => {
  const { t } = useTranslation();

  const validationSchema = yup.object().shape({
    profile: yup.object().shape({
      displayName: displayNameValidator({ required: true }),
      description: MarkdownValidator(MARKDOWN_TEXT_LENGTH, { required: true }),
      tagsets: yup.array().of(
        yup.object().shape({
          tags: yup.array().of(textLengthValidator({ minLength: 2 })),
        })
      ),
    }),
    ...validator,
  });

  // todo: review this as some Visuals come without aspectRatio and other expected props
  const visual = template?.profile.visual as Visual | undefined;

  const renderChildren = typeof children === 'function' ? children : () => children;

  // Track dirty state changes using a ref to avoid re-renders
  const previousDirtyRef = useRef<boolean | undefined>(undefined);

  return (
    <Formik enableReinitialize initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {formState => {
        // Call onDirtyChange when dirty state changes
        if (previousDirtyRef.current !== formState.dirty) {
          previousDirtyRef.current = formState.dirty;
          actions.onDirtyChange?.(formState.dirty);
        }

        const actionsContent = actions.renderActions(formState);
        const renderedActions = actionsContent ? (
          actions.portal ? (
            createPortal(actionsContent, actions.portal)
          ) : (
            <DialogFooter>{actionsContent}</DialogFooter>
          )
        ) : null;

        return (
          <GridContainer disablePadding>
            <PageContentColumn columns={3}>
              <PageContentBlockSeamless disablePadding>
                <BlockSectionTitleWithIcon
                  icon={<InfoOutlined />}
                  tooltip={t('templateDialog.profile.help', {
                    entityTypeName: t(`common.enums.templateType.${templateType}`),
                  })}
                >
                  {t('templateDialog.profile.title')}
                </BlockSectionTitleWithIcon>
                <FormikInputField name="profile.displayName" title={t('templateDialog.profile.fields.displayName')} />
                <Box marginBottom={gutters(-1)}>
                  <FormikMarkdownField
                    name="profile.description"
                    title={t('templateDialog.profile.fields.description')}
                    maxLength={MARKDOWN_TEXT_LENGTH}
                  />
                </Box>
                <TagsetField
                  name="profile.tagsets[0].tags"
                  title={t('templateDialog.profile.fields.tags')}
                  helpTextIcon={t('components.post-creation.info-step.tags-help-text')}
                />
                {visual && <VisualUpload visual={visual} />}
              </PageContentBlockSeamless>
            </PageContentColumn>
            <PageContentColumn columns={9}>
              <PageContentBlockSeamless disablePadding>
                <BlockSectionTitle>{t(`common.enums.templateType.${templateType}`)}</BlockSectionTitle>
                {renderChildren(formState)}
              </PageContentBlockSeamless>
            </PageContentColumn>
            {renderedActions}
          </GridContainer>
        );
      }}
    </Formik>
  );
};

export default TemplateFormBase;
