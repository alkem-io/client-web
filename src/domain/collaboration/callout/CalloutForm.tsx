import React, { FC, useCallback, useMemo, useState } from 'react';
import { Formik, FormikConfig } from 'formik';
import {
  CalloutState,
  CalloutType,
  PostTemplateFragment,
  Tagset,
  WhiteboardTemplateFragment,
} from '../../../core/apollo/generated/graphql-schema';
import * as yup from 'yup';
import FormRow from '../../../common/components/FormLayout';
import { useTranslation } from 'react-i18next';
import { MID_TEXT_LENGTH } from '../../../core/ui/forms/field-length.constants';
import FormikInputField from '../../../common/components/composite/forms/FormikInputField';
import FormikEffectFactory from '../../../common/utils/formik/formik-effect/FormikEffect';
import { FormikSwitch } from '../../../common/components/composite/forms/FormikSwitch';
import { displayNameValidator } from '../../../common/utils/validator/displayNameValidator';
import WhiteboardTemplatesChooser, {
  LibraryWhiteboardTemplate,
  TemplateOrigin,
  WhiteboardTemplateListItem,
} from './creation-dialog/CalloutTemplate/WhiteboardTemplateChooser';
import MarkdownValidator from '../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import FormikMarkdownField from '../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { TagsetSegment } from '../../platform/admin/components/Common/TagsetSegment';
// import WhiteboardTemplatesLibrary from '../canvas/WhiteboardTemplatesLibrary/WhiteboardTemplatesLibrary';
import ReferenceSegment from '../../platform/admin/components/Common/ReferenceSegment';
import { Reference } from '../../common/profile/Profile';
import { ProfileReferenceSegment } from '../../platform/admin/components/Common/ProfileReferenceSegment';
import PostTemplatesChooser from './creation-dialog/CalloutTemplate/PostTemplateChooser';
import Gutters from '../../../core/ui/grid/Gutters';
import { gutters } from '../../../core/ui/grid/utils';

export type WhiteboardTemplateData = {
  id?: string;
  displayName?: string;
  origin?: TemplateOrigin;
  innovationPackId?: string;
};

type FormValueType = {
  displayName: string;
  description: string;
  type: CalloutType;
  tagsets: Tagset[];
  references: Reference[];
  opened: boolean;
  postTemplateType?: string;
  postTemplateDefaultDescription?: string;
  whiteboardTemplateData?: WhiteboardTemplateData;
};

const FormikEffect = FormikEffectFactory<FormValueType>();

export type CalloutFormInput = {
  id?: string;
  displayName?: string;
  description?: string;
  tags?: string[];
  references?: Reference[];
  type?: CalloutType;
  state?: CalloutState;
  postTemplateType?: string;
  postTemplateDefaultDescription?: string;
  whiteboardTemplateData?: WhiteboardTemplateData;
  profileId?: string;
};

export type CalloutFormOutput = {
  displayName: string;
  description: string;
  tags: string[];
  references: Reference[];
  type: CalloutType;
  state: CalloutState;
  postTemplateType?: string;
  postTemplateDefaultDescription?: string;
  whiteboardTemplateData?: WhiteboardTemplateData;
};

export interface CalloutFormProps {
  calloutType: CalloutType;
  callout: CalloutFormInput;
  editMode?: boolean;
  onChange?: (callout: CalloutFormOutput) => void;
  onStatusChanged?: (isValid: boolean) => void;
  children?: FormikConfig<FormValueType>['children'];
  calloutNames: string[];
  templates: { postTemplates: PostTemplateFragment[]; whiteboardTemplates: WhiteboardTemplateFragment[] };
}

const CalloutForm: FC<CalloutFormProps> = ({
  calloutType,
  callout,
  calloutNames,
  templates,
  editMode = false,
  onChange,
  onStatusChanged,
  children,
}) => {
  const { t } = useTranslation();
  const [libraryWhiteboardTemplates, setLibraryWhiteboardTemplates] = useState<WhiteboardTemplateListItem[]>([]);

  const tagsets: Tagset[] = useMemo(
    () => [
      {
        id: '-1',
        name: 'default',
        tags: callout?.tags ?? [],
      },
    ],
    [callout?.tags]
  );

  const initialValues: FormValueType = useMemo(
    () => ({
      displayName: callout?.displayName ?? '',
      description: callout?.description ?? '',
      type: calloutType,
      tagsets,
      references: callout?.references ?? [],
      opened: (callout?.state ?? CalloutState.Open) === CalloutState.Open,
      postTemplateDefaultDescription: callout?.postTemplateDefaultDescription ?? '',
      whiteboardTemplateData: callout?.whiteboardTemplateData ?? {
        id: '',
        displayName: '',
        origin: 'Hub',
      },
    }),
    [callout?.id, tagsets]
  );

  const uniqueNameValidator = yup
    .string()
    .required(t('common.field-required'))
    .test('is-valid-name', t('components.callout-creation.info-step.unique-title-validation-text'), value => {
      if (editMode) {
        return Boolean(value && (!calloutNames.includes(value) || value === callout?.displayName));
      } else {
        return Boolean(value && !calloutNames.includes(value));
      }
    });

  const validationSchema = yup.object().shape({
    displayName: displayNameValidator.concat(uniqueNameValidator),
    description: MarkdownValidator(MID_TEXT_LENGTH)
      .required(t('common.field-required'))
      .min(3, ({ min }) => t('common.field-min-length', { min })),
    type: yup.string().required(t('common.field-required')),
    opened: yup.boolean().required(),
    postTemplateDefaultDescription: yup
      .string()
      .when('type', { is: CalloutType.Card, then: yup.string().required(t('common.field-required')) }),
    whiteboardTemplateData: yup.object().when('type', {
      is: CalloutType.Canvas,
      then: yup.object().shape({
        id: yup.string().required(),
        displayName: yup.string().required(),
        origin: yup.string().optional(),
        innovationPackId: yup.string().optional(),
      }),
    }),
  });

  const handleChange = (values: FormValueType) => {
    const callout: CalloutFormOutput = {
      displayName: values.displayName,
      description: values.description,
      tags: values.tagsets[0].tags,
      references: values.references,
      type: calloutType,
      state: values.opened ? CalloutState.Open : CalloutState.Closed,
      postTemplateType: values.postTemplateType,
      postTemplateDefaultDescription: values.postTemplateDefaultDescription,
      whiteboardTemplateData: values.whiteboardTemplateData,
    };
    onChange?.(callout);
  };

  const updateLibraryTemplates = useCallback(
    (template: LibraryWhiteboardTemplate) => {
      const newTemplate: WhiteboardTemplateListItem = { ...template, origin: 'Library' };
      setLibraryWhiteboardTemplates([...libraryWhiteboardTemplates, newTemplate]);
    },
    [libraryWhiteboardTemplates]
  );

  const hubTemplates = templates.whiteboardTemplates.map<WhiteboardTemplateListItem>(templ => ({
    ...templ,
    origin: 'Hub',
  }));

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
          <Gutters>
            <FormikEffect onChange={handleChange} onStatusChange={onStatusChanged} />
            <FormikInputField name="displayName" title={t('common.title')} placeholder={t('common.title')} />
            <FormikMarkdownField
              name="description"
              title={t('components.callout-creation.info-step.description')}
              rows={7}
              maxLength={MID_TEXT_LENGTH}
              withCounter
            />
            {editMode && (
              <ProfileReferenceSegment
                compactMode
                references={formikState.values.references}
                profileId={callout?.profileId}
                marginTop={gutters(-1)}
              />
            )}
            {!editMode && (
              <ReferenceSegment compactMode references={formikState.values.references} marginTop={gutters(-1)} />
            )}
            <TagsetSegment
              tagsets={tagsets}
              title={t('common.tags')}
              helpText={t('components.aspect-creation.info-step.tags-help-text')}
            />
            {calloutType === CalloutType.Card && (
              <PostTemplatesChooser name="postTemplateDefaultDescription" editMode={editMode} />
            )}
            {calloutType === CalloutType.Canvas && (
              <FormRow>
                {/* <WhiteboardTemplatesLibrary onSelectTemplate={handleImportTemplate} /> */}
                <WhiteboardTemplatesChooser
                  name="whiteboardTemplateData"
                  templates={[...hubTemplates, ...libraryWhiteboardTemplates]}
                  editMode={editMode}
                  onSelectLibraryTemplate={updateLibraryTemplates}
                />
              </FormRow>
            )}
            <FormikSwitch name="opened" title={t('callout.state-permission')} />
          </Gutters>
          {typeof children === 'function' ? (children as Function)(formikState) : children}
        </>
      )}
    </Formik>
  );
};

export default CalloutForm;
