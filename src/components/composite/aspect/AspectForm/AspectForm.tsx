import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Formik, FormikConfig } from 'formik';
import { Grid } from '@mui/material';
import FormikInputField from '../../forms/FormikInputField';
import { TagsetSegment, tagsetSegmentSchema } from '../../../Admin/Common/TagsetSegment';
import { SectionSpacer } from '../../../../domain/shared/components/Section/Section';
import FormikEffectFactory from '../../../../utils/formik/formik-effect/FormikEffect';
import { AspectCreationType } from '../AspectCreationDialog/AspectCreationDialog';
import { Aspect, Tagset } from '../../../../models/graphql-schema';
import ReferenceSegment, { referenceSegmentSchema } from '../../../Admin/Common/ReferenceSegment';
import { PushFunc, RemoveFunc } from '../../../../hooks';
import { Reference } from '../../../../models/Profile';
import MarkdownInput from '../../../Admin/Common/MarkdownInput';
import FormRow from '../../../../domain/shared/layout/FormLayout';
import AspectTypeFormField from '../../../../domain/aspect/AspectTypeFormField';
import { displayNameValidator } from '../../../../utils/validator';

type FormValueType = {
  name: string;
  description: string;
  tagsets: Tagset[];
  aspectNames: string[];
  type: string;
  references: Reference[];
};

const FormikEffect = FormikEffectFactory<FormValueType>();

type AspectEditFields = Partial<Pick<Aspect, 'banner' | 'bannerNarrow'>> & { references?: Reference[] };
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
      tags: aspect?.tags ?? [],
    },
  ];

  const getDescriptionValue = () => {
    if (!aspect) {
      return '';
    }
    return aspect.description ?? descriptionTemplate ?? '';
  };

  const initialValues: FormValueType = {
    name: aspect?.displayName ?? '',
    description: getDescriptionValue(),
    tagsets,
    aspectNames: aspectNames ?? [],
    type: aspect?.type ?? '',
    references: aspect?.references ?? [],
  };

  const uniqueNameValidator = yup
    .string()
    .required('name is required')
    .test('is-valid-name', t('components.aspect-creation.info-step.unique-name-validation-text'), value =>
      Boolean(value && (!aspectNames?.includes(value) || value === aspect?.displayName))
    );

  const validationSchema = yup.object().shape({
    name: displayNameValidator.concat(uniqueNameValidator),
    description: yup.string().required(),
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
            <FormRow cols={2}>
              <FormikInputField
                name={'name'}
                title={t('common.title')}
                required
                placeholder={t('components.aspect-creation.info-step.name-help-text')}
              />
            </FormRow>
            <FormRow cols={2}>
              <AspectTypeFormField name="type" value={formikState.values.type} />
            </FormRow>
            <SectionSpacer />
            <MarkdownInput
              name="description"
              label={t('components.aspect-creation.info-step.description')}
              placeholder={t('components.aspect-creation.info-step.description-placeholder')}
              tooltipLabel={t('components.aspect-creation.info-step.description-help-text')}
              required
              loading={loading}
              rows={7}
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
