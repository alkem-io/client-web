import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Formik, FormikConfig } from 'formik';
import { Grid } from '@mui/material';
import FormikInputField from '../../../../common/components/composite/forms/FormikInputField';
import { TagsetSegment, tagsetSegmentSchema } from '../../../platform/admin/components/Common/TagsetSegment';
import { SectionSpacer } from '../../../shared/components/Section/Section';
import FormikEffectFactory from '../../../../common/utils/formik/formik-effect/FormikEffect';
import { AspectCreationType } from '../AspectCreationDialog/AspectCreationDialog';
import { Aspect, Tagset } from '../../../../core/apollo/generated/graphql-schema';
import ReferenceSegment, { referenceSegmentSchema } from '../../../platform/admin/components/Common/ReferenceSegment';
import { PushFunc, RemoveFunc } from '../../../shared/Reference/useEditReference';
import { Reference } from '../../../common/profile/Profile';
import MarkdownInput from '../../../platform/admin/components/Common/MarkdownInput';
import FormRow from '../../../shared/layout/FormLayout';
import { displayNameValidator } from '../../../../common/utils/validator';
import { VERY_LONG_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';

type FormValueType = {
  name: string;
  description: string;
  tagsets: Tagset[];
  aspectNames: string[];
  type: string;
  references: Reference[];
};

const FormikEffect = FormikEffectFactory<FormValueType>();

type AspectEditFields = Partial<Pick<Aspect, 'banner' | 'bannerNarrow'>> & { references?: Reference[] } & {
  id?: string;
};
export type AspectFormOutput = {
  displayName: string;
  description: string;
  tags: string[];
  type: string;
} & AspectEditFields;
export type AspectFormInput = AspectCreationType & AspectEditFields;
export interface AspectFormProps {
  aspect?: AspectFormInput;
  aspectNames?: string[];
  edit?: boolean;
  descriptionTemplate?: string;
  tags: string[] | undefined;
  loading?: boolean;
  onChange?: (aspect: AspectFormOutput) => void;
  onStatusChanged?: (isValid: boolean) => void;
  onAddReference?: (push: PushFunc) => void;
  onRemoveReference?: (ref: Reference, remove: RemoveFunc) => void;
  children?: FormikConfig<FormValueType>['children'];
}

const AspectForm: FC<AspectFormProps> = ({
  aspect,
  aspectNames,
  descriptionTemplate,
  tags,
  edit = false,
  loading,
  onChange,
  onStatusChanged,
  onAddReference,
  onRemoveReference,
  children,
}) => {
  const { t } = useTranslation();

  const tagsets: Tagset[] = [
    {
      id: '-1',
      name: 'default',
      tags: tags ?? [],
    },
  ];

  const getDescriptionValue = () => {
    if (!aspect) {
      return '';
    }
    return aspect.profileData?.description ?? descriptionTemplate ?? '';
  };

  const initialValues: FormValueType = useMemo(
    () => ({
      name: aspect?.displayName ?? '',
      description: getDescriptionValue(),
      tagsets,
      aspectNames: aspectNames ?? [],
      type: aspect?.type ?? '',
      references: aspect?.references ?? [],
    }),
    [aspect?.id]
  );

  const uniqueNameValidator = yup
    .string()
    .required(t('common.field-required'))
    .test('is-valid-name', t('components.aspect-creation.info-step.unique-name-validation-text'), value => {
      if (edit) {
        return Boolean(value && (!aspectNames?.includes(value) || value === aspect?.displayName));
      } else {
        return Boolean(value && !aspectNames?.includes(value));
      }
    });

  const validationSchema = yup.object().shape({
    name: displayNameValidator.concat(uniqueNameValidator),
    description: MarkdownValidator(VERY_LONG_TEXT_LENGTH).required(),
    tagsets: tagsetSegmentSchema,
    references: referenceSegmentSchema,
  });

  const handleChange = (values: FormValueType) => {
    const aspect: AspectFormOutput = {
      displayName: values.name,
      description: values.description,
      tags: values.tagsets[0].tags,
      type: values.type,
      references: values.references,
    };

    onChange?.(aspect);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      validateOnMount
      onSubmit={() => {}}
    >
      {formikState => (
        <>
          <Grid container spacing={2}>
            <FormikEffect onChange={handleChange} onStatusChange={onStatusChanged} />
            <FormRow>
              <FormikInputField
                name={'name'}
                title={t('common.title')}
                required
                placeholder={t('components.aspect-creation.info-step.name-help-text')}
              />
            </FormRow>
            <SectionSpacer />
            <MarkdownInput
              name="description"
              label={t('components.aspect-creation.info-step.description')}
              placeholder={t('components.aspect-creation.info-step.description-placeholder')}
              required
              loading={loading}
              rows={7}
              maxLength={VERY_LONG_TEXT_LENGTH}
              withCounter
            />
            <SectionSpacer />
            <TagsetSegment
              tagsets={tagsets}
              title={t('common.tags')}
              helpText={t('components.aspect-creation.info-step.tags-help-text')}
              loading={loading}
            />
            {edit && (
              <>
                <SectionSpacer />
                <ReferenceSegment
                  references={formikState.values.references}
                  onAdd={onAddReference}
                  onRemove={onRemoveReference}
                />
              </>
            )}
          </Grid>
          {typeof children === 'function' ? (children as Function)(formikState) : children}
        </>
      )}
    </Formik>
  );
};

export default AspectForm;
