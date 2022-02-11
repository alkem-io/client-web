import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useInputField } from '../../../Admin/Common/useInputField';
import * as yup from 'yup';
import { NameSegment, nameSegmentSchema, nameValidator } from '../../../Admin/Common/NameSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../../../Admin/Common/TagsetSegment';
import { Formik } from 'formik';
import { Box } from '@mui/material';
import { SectionSpacer } from '../../../core/Section/Section';
import FormikEffectFactory from '../../../../utils/formik/formik-effect/FormikEffect';
import { AspectCreationType } from '../AspectCreationDialog/AspectCreationDialog';
import { Tagset } from '../../../../models/graphql-schema';

type FormValueType = {
  name: string;
  nameID: string;
  description: string;
  tagsets: Tagset[];
  aspectNames: string[];
};

const FormikEffect = FormikEffectFactory<FormValueType>();

export type AspectFormOutput = { displayName: string; nameID: string; description: string; tags: string[] };
export type AspectFormInput = AspectCreationType;
export interface AspectFormProps {
  aspect?: AspectFormInput;
  aspectNames?: string[];
  edit?: boolean;
  templateDescription?: string;
  onChange?: (aspect: AspectFormOutput) => void;
  onStatusChanged?: (isValid: boolean) => void;
}

const AspectForm: FC<AspectFormProps> = ({
  aspect,
  aspectNames,
  templateDescription,
  edit = false,
  onChange,
  onStatusChanged,
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
    nameID: aspect?.nameID ?? '',
    description: aspect?.description ?? templateDescription ?? '',
    tagsets,
    aspectNames: aspectNames ?? [],
  };

  const uniqueNameValidator = yup.string().test('is-valid-name', '${path} is already used in another aspect', value => {
    if (value && aspectNames && !aspectNames.includes(value)) return true;
    return false;
  });

  const validationSchema = yup.object().shape({
    name: uniqueNameValidator.concat(nameValidator),
    nameID: nameSegmentSchema.fields?.nameID || yup.string(),
    description: yup.string().required(),
    tagsets: tagsetSegmentSchema,
  });

  const handleChange = (values: FormValueType) => {
    const aspect: AspectFormOutput = {
      displayName: values.name,
      nameID: values.nameID,
      description: values.description,
      tags: values.tagsets[0].tags,
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
      {() => (
        <Box>
          <FormikEffect onChange={handleChange} onStatusChange={onStatusChanged} />
          <NameSegment
            disabled={edit}
            required={!edit}
            nameHelpText={t('components.aspect-creation.info-step.name-help-text')}
            nameIDHelpText={t('components.aspect-creation.info-step.name-id-help-text')}
          />
          <SectionSpacer />
          {getInputField({
            name: 'description',
            label: t('components.aspect-creation.info-step.description'),
            placeholder: t('components.aspect-creation.info-step.description-placeholder'),
            required: true,
            helpText: t('components.aspect-creation.info-step.description-help-text'),
          })}
          <SectionSpacer />
          <TagsetSegment
            tagsets={tagsets}
            title={t('common.tags')}
            helpText={t('components.aspect-creation.info-step.tags-help-text')}
          />
        </Box>
      )}
    </Formik>
  );
};
export default AspectForm;
