import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useInputField } from '../../../Admin/Common/useInputField';
import * as yup from 'yup';
import { TagsetSegment, tagsetSegmentSchema } from '../../../Admin/Common/TagsetSegment';
import { Formik } from 'formik';
import { Box } from '@mui/material';
import { SectionSpacer } from '../../../core/Section/Section';
import FormikEffectFactory from '../../../../utils/formik/formik-effect/FormikEffect';
import { AspectCreationType } from '../AspectCreationDialog/AspectCreationDialog';
import { Aspect, Tagset } from '../../../../models/graphql-schema';
import ReferenceSegment, { referenceSegmentSchema } from '../../../Admin/Common/ReferenceSegment';
import { PushFunc, RemoveFunc } from '../../../../hooks';
import { Reference } from '../../../../models/Profile';
import { nameValidator } from '../../../Admin/Common/NameSegment';

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
  templateDescription?: string;
  loading?: boolean;
  onChange?: (aspect: AspectFormOutput) => void;
  onStatusChanged?: (isValid: boolean) => void;
  onAddReference?: (push: PushFunc) => void;
  onRemoveReference?: (ref: Reference, remove: RemoveFunc) => void;
}

const AspectForm: FC<AspectFormProps> = ({
  aspect,
  aspectNames,
  templateDescription,
  edit = false,
  loading,
  onChange,
  onStatusChanged,
  onAddReference,
  onRemoveReference,
}) => {
  const { t } = useTranslation();
  const getInputField = useInputField();

  const tagsets: Tagset[] = [
    {
      id: '-1',
      name: 'default',
      tags: aspect?.tags ?? [],
    },
  ];

  const initialValues: FormValueType = {
    name: aspect?.displayName ?? '',
    description: aspect?.description ?? templateDescription ?? '',
    tagsets,
    aspectNames: aspectNames ?? [],
    type: aspect?.type ?? '',
    references: aspect?.references ?? [],
  };

  const uniqueNameValidator = yup
    .string()
    .test('is-valid-name', t('components.aspect-creation.info-step.unique-name-validation-text'), value => {
      if (value && aspectNames && !aspectNames.includes(value)) return true;
      return false;
    });

  const validationSchema = yup.object().shape({
    name: uniqueNameValidator.concat(nameValidator),
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

    onChange && onChange(aspect);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      validateOnMount
      onSubmit={() => {}}
    >
      {({ values: { references } }) => (
        <Box>
          <FormikEffect onChange={handleChange} onStatusChange={onStatusChanged} />
          {getInputField({
            name: 'name',
            label: t('components.nameSegment.name'),
            required: true,
            helpText: t('components.aspect-creation.info-step.name-help-text'),
          })}
          <SectionSpacer />
          {getInputField({
            name: 'type',
            label: t('components.aspect-creation.type-step.label'),
            helpText: t('components.aspect-creation.type-step.type-help-text'),
            required: true,
            disabled: true,
            loading: loading,
          })}
          <SectionSpacer />
          {getInputField({
            name: 'description',
            label: t('components.aspect-creation.info-step.description'),
            placeholder: t('components.aspect-creation.info-step.description-placeholder'),
            helpText: t('components.aspect-creation.info-step.description-help-text'),
            required: true,
            loading: loading,
          })}
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
              <ReferenceSegment references={references} onAdd={onAddReference} onRemove={onRemoveReference} />
            </>
          )}
        </Box>
      )}
    </Formik>
  );
};
export default AspectForm;
