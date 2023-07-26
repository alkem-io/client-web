import React, { FC, useMemo } from 'react';
import { Formik, FormikConfig } from 'formik';
import {
  CalloutDisplayLocation,
  CalloutState,
  CalloutType,
  Tagset,
  TagsetType,
} from '../../../core/apollo/generated/graphql-schema';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { LONG_TEXT_LENGTH } from '../../../core/ui/forms/field-length.constants';
import FormikInputField from '../../../core/ui/forms/FormikInputField/FormikInputField';
import FormikEffectFactory from '../../../common/utils/formik/formik-effect/FormikEffect';
import { FormikSwitch } from '../../../common/components/composite/forms/FormikSwitch';
import { displayNameValidator } from '../../../common/utils/validator/displayNameValidator';
import WhiteboardTemplatesChooser from './creation-dialog/CalloutTemplate/WhiteboardTemplateChooser';
import MarkdownValidator from '../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import FormikMarkdownField from '../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { TagsetSegment } from '../../platform/admin/components/Common/TagsetSegment';
import ReferenceSegment from '../../platform/admin/components/Common/ReferenceSegment';
import { Reference } from '../../common/profile/Profile';
import { ProfileReferenceSegment } from '../../platform/admin/components/Common/ProfileReferenceSegment';
import PostTemplatesChooser from './creation-dialog/CalloutTemplate/PostTemplateChooser';
import Gutters from '../../../core/ui/grid/Gutters';
import { gutters } from '../../../core/ui/grid/utils';
import EmptyWhiteboard from '../../../common/components/composite/entities/Whiteboard/EmptyWhiteboard';
import { PostTemplateFormSubmittedValues } from '../../platform/admin/templates/PostTemplates/PostTemplateForm';
import { WhiteboardTemplateFormSubmittedValues } from '../../platform/admin/templates/WhiteboardTemplates/WhiteboardTemplateForm';
import FormikSelect from '../../../common/components/composite/forms/FormikSelect';
import { FormikSelectValue } from '../../../common/components/composite/forms/FormikAutocomplete';
import { FormControlLabel } from '@mui/material';
import { Caption } from '../../../core/ui/typography';
import CalloutWhiteboardField, {
  WhiteboardFieldSubmittedValues,
  WhiteboardFieldSubmittedValuesWithPreviewImages,
} from './creation-dialog/CalloutWhiteboardField/CalloutWhiteboardField';
import { JourneyTypeName } from '../../challenge/JourneyTypeName';
import { JourneyCalloutDisplayLocationOptions } from './CalloutsInContext/CalloutsGroup';

type FormValueType = {
  displayName: string;
  description: string;
  type: CalloutType;
  tagsets: Tagset[];
  references: Reference[];
  opened: boolean;
  group: CalloutDisplayLocation;
  postTemplateData?: PostTemplateFormSubmittedValues;
  whiteboardTemplateData?: WhiteboardTemplateFormSubmittedValues;
  whiteboard?: WhiteboardFieldSubmittedValuesWithPreviewImages;
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
  group?: CalloutDisplayLocation;
  postTemplateData?: PostTemplateFormSubmittedValues;
  whiteboardTemplateData?: WhiteboardTemplateFormSubmittedValues;
  whiteboard?: WhiteboardFieldSubmittedValues;
  profileId?: string;
};

export type CalloutFormOutput = {
  displayName: string;
  description: string;
  tags: string[];
  references: Reference[];
  type: CalloutType;
  state: CalloutState;
  group: CalloutDisplayLocation;
  postTemplateData?: PostTemplateFormSubmittedValues;
  whiteboardTemplateData?: WhiteboardTemplateFormSubmittedValues;
  whiteboard?: WhiteboardFieldSubmittedValuesWithPreviewImages;
};

export interface CalloutFormProps {
  calloutType: CalloutType;
  callout: CalloutFormInput;
  editMode?: boolean;
  canChangeCalloutGroup?: boolean;
  onChange?: (callout: CalloutFormOutput) => void;
  onStatusChanged?: (isValid: boolean) => void;
  children?: FormikConfig<FormValueType>['children'];
  calloutNames: string[];
  journeyTypeName: JourneyTypeName;
}

const CalloutForm: FC<CalloutFormProps> = ({
  calloutType,
  callout,
  calloutNames,
  editMode = false,
  canChangeCalloutGroup,
  onChange,
  onStatusChanged,
  journeyTypeName,
  children,
}) => {
  const { t } = useTranslation();

  const tagsets: Tagset[] = useMemo(
    () => [
      {
        id: '-1',
        name: 'default',
        tags: callout?.tags ?? [],
        allowedValues: [],
        type: TagsetType.Freeform,
      },
    ],
    [callout?.id]
  );

  const initialValues: FormValueType = useMemo(
    () => ({
      displayName: callout?.displayName ?? '',
      description: callout?.description ?? '',
      type: calloutType,
      tagsets,
      references: callout?.references ?? [],
      opened: (callout?.state ?? CalloutState.Open) === CalloutState.Open,
      group: callout?.group ?? CalloutDisplayLocation.Knowledge,
      postTemplateData: callout?.postTemplateData ?? {
        profile: {
          displayName: '',
        },
        defaultDescription: '',
        type: '',
      },
      whiteboardTemplateData: callout?.whiteboardTemplateData ?? {
        profile: {
          displayName: t('components.callout-creation.template-step.whiteboard-empty-template'),
        },
        value: JSON.stringify(EmptyWhiteboard),
      },
      whiteboard: callout?.whiteboard
        ? {
            ...callout.whiteboard,
            previewImages: undefined,
          }
        : {
            profileData: {
              displayName: t('components.callout-creation.whiteboard.title'),
            },
            value: JSON.stringify(EmptyWhiteboard),
            previewImages: undefined,
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
    description: MarkdownValidator(LONG_TEXT_LENGTH),
    type: yup.string().required(t('common.field-required')),
    opened: yup.boolean().required(),
    postTemplateData: yup.object().when('type', {
      is: CalloutType.PostCollection,
      then: yup.object().shape({
        defaultDescription: yup.string().required(t('common.field-required')),
      }),
    }),
    whiteboardTemplateData: yup.object().when('type', {
      is: CalloutType.WhiteboardCollection,
      then: yup.object().shape({
        profile: yup.object().shape({
          displayName: yup.string(),
        }),
        value: yup.string().required(),
      }),
    }),
    whiteboard: yup.object().when('type', {
      is: CalloutType.Whiteboard,
      then: yup.object().shape({
        value: yup.string().required(),
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
      group: values.group,
      postTemplateData: values.postTemplateData,
      whiteboardTemplateData: values.whiteboardTemplateData,
      whiteboard: values.whiteboard,
    };
    onChange?.(callout);
  };

  const calloutsGroups = useMemo<FormikSelectValue[]>(() => {
    const locations = JourneyCalloutDisplayLocationOptions[journeyTypeName];

    if (editMode) {
      return locations.map(key => ({
        id: key,
        name: t(`callout.callout-groups.${key}` as const),
      }));
    }
    return [];
  }, [editMode]);

  // Enable or disable form fields depending on the callout type and other conditions
  const formConfiguration = {
    references: calloutType !== CalloutType.LinkCollection,
    linkCollectionAdd: calloutType === CalloutType.LinkCollection,
    tags: true,
    postTemplate: calloutType === CalloutType.PostCollection,
    whiteboardTemplate: calloutType === CalloutType.WhiteboardCollection,
    newResponses: calloutType !== CalloutType.LinkCollection && calloutType !== CalloutType.Whiteboard,
    groupChange: editMode && Boolean(canChangeCalloutGroup),
    whiteboard: calloutType === CalloutType.Whiteboard,
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
          <Gutters>
            <FormikEffect onChange={handleChange} onStatusChange={onStatusChanged} />
            <FormikInputField name="displayName" title={t('common.title')} placeholder={t('common.title')} />
            {!editMode && formConfiguration.whiteboard && <CalloutWhiteboardField name="whiteboard" />}
            <FormikMarkdownField
              name="description"
              title={t('components.callout-creation.info-step.description')}
              rows={7}
              maxLength={LONG_TEXT_LENGTH}
              withCounter
            />
            {editMode && formConfiguration.references && (
              <ProfileReferenceSegment
                compactMode
                references={formikState.values.references}
                profileId={callout?.profileId}
                marginTop={gutters(-1)}
              />
            )}
            {!editMode && formConfiguration.references && (
              <ReferenceSegment compactMode references={formikState.values.references} marginTop={gutters(-1)} />
            )}
            {formConfiguration.tags && (
              <TagsetSegment
                tagsets={tagsets}
                title={t('common.tags')}
                helpText={t('components.post-creation.info-step.tags-help-text')}
              />
            )}
            {!editMode && formConfiguration.linkCollectionAdd && (
              <Caption>{t('callout.link-collection.save-to-add')}</Caption>
            )}
            {formConfiguration.postTemplate && <PostTemplatesChooser name="postTemplateData" />}
            {formConfiguration.whiteboardTemplate && <WhiteboardTemplatesChooser name="whiteboardTemplateData" />}
            {formConfiguration.newResponses && <FormikSwitch name="opened" title={t('callout.state-permission')} />}
            {formConfiguration.groupChange && (
              <FormControlLabel
                sx={{ margin: 0, '& > span': { marginRight: theme => theme.spacing(2) } }}
                labelPlacement="start"
                control={<FormikSelect name="group" values={calloutsGroups} />}
                label={t('callout.callout-location')}
              />
            )}
          </Gutters>
          {typeof children === 'function' ? (children as Function)(formikState) : children}
        </>
      )}
    </Formik>
  );
};

export default CalloutForm;
