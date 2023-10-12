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
import { MARKDOWN_TEXT_LENGTH } from '../../../core/ui/forms/field-length.constants';
import FormikInputField from '../../../core/ui/forms/FormikInputField/FormikInputField';
import FormikEffectFactory from '../../../core/ui/forms/FormikEffect';
import { FormikSwitch } from '../../../core/ui/forms/FormikSwitch';
import { displayNameValidator } from '../../../core/ui/forms/validator/displayNameValidator';
import WhiteboardTemplatesChooser from './creationDialog/CalloutTemplate/WhiteboardTemplateChooser';
import MarkdownValidator from '../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import FormikMarkdownField from '../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { TagsetSegment } from '../../platform/admin/components/Common/TagsetSegment';
import ReferenceSegment from '../../platform/admin/components/Common/ReferenceSegment';
import { Reference } from '../../common/profile/Profile';
import { ProfileReferenceSegment } from '../../platform/admin/components/Common/ProfileReferenceSegment';
import PostTemplatesChooser from './creationDialog/CalloutTemplate/PostTemplateChooser';
import Gutters from '../../../core/ui/grid/Gutters';
import { gutters } from '../../../core/ui/grid/utils';
import EmptyWhiteboard from '../../common/whiteboard/EmptyWhiteboard';
import FormikSelect from '../../../core/ui/forms/FormikSelect';
import { FormikSelectValue } from '../../../core/ui/forms/FormikAutocomplete';
import { FormControlLabel } from '@mui/material';
import { Caption } from '../../../core/ui/typography';
import CalloutWhiteboardField, {
  WhiteboardFieldSubmittedValues,
  WhiteboardFieldSubmittedValuesWithPreviewImages,
} from './creationDialog/CalloutWhiteboardField/CalloutWhiteboardField';
import { JourneyTypeName } from '../../journey/JourneyTypeName';
import { JourneyCalloutDisplayLocationOptions } from './CalloutsInContext/CalloutsGroup';

type FormValueType = {
  displayName: string;
  description: string;
  type: CalloutType;
  tagsets: Tagset[];
  references: Reference[];
  opened: boolean;
  displayLocation: CalloutDisplayLocation;
  postDescription?: string;
  whiteboardContent?: string;
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
  displayLocation?: CalloutDisplayLocation;
  contributionDefaults?: {
    postDescription?: string;
    whiteboardContent?: string;
  };
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
  displayLocation: CalloutDisplayLocation;
  postDescription?: string;
  whiteboardContent?: string;
  whiteboard?: WhiteboardFieldSubmittedValuesWithPreviewImages;
};

export interface CalloutFormProps {
  calloutType: CalloutType;
  callout: CalloutFormInput;
  editMode?: boolean;
  canChangeCalloutLocation?: boolean;
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
  canChangeCalloutLocation,
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
      displayLocation: callout?.displayLocation ?? CalloutDisplayLocation.Knowledge,
      postDescription: callout.contributionDefaults?.postDescription ?? '',
      whiteboardContent: callout.contributionDefaults?.whiteboardContent ?? JSON.stringify(EmptyWhiteboard),
      whiteboard: callout?.whiteboard
        ? {
            ...callout.whiteboard,
            previewImages: undefined,
          }
        : {
            profileData: {
              displayName: t('components.callout-creation.whiteboard.title'),
            },
            content: JSON.stringify(EmptyWhiteboard),
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
    description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
    type: yup.string().required(t('common.field-required')),
    opened: yup.boolean().required(),
    postDescription: yup.string().when('type', {
      is: CalloutType.PostCollection,
      then: yup.string().required(),
    }),
    whiteboardContent: yup.string().when('type', {
      is: CalloutType.Whiteboard || CalloutType.WhiteboardRt,
      then: yup.string().required(),
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
      displayLocation: values.displayLocation,
      postDescription: values.postDescription,
      whiteboardContent: values.whiteboardContent,
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
    newResponses:
      calloutType !== CalloutType.LinkCollection &&
      calloutType !== CalloutType.Whiteboard &&
      calloutType !== CalloutType.WhiteboardRt,
    locationChange: editMode && Boolean(canChangeCalloutLocation),
    whiteboard: calloutType === CalloutType.Whiteboard || calloutType === CalloutType.WhiteboardRt,
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
              maxLength={MARKDOWN_TEXT_LENGTH}
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
            {formConfiguration.postTemplate && <PostTemplatesChooser name="postDescription" />}
            {formConfiguration.whiteboardTemplate && <WhiteboardTemplatesChooser name="whiteboardContent" />}
            {formConfiguration.newResponses && <FormikSwitch name="opened" title={t('callout.state-permission')} />}
            {formConfiguration.locationChange && (
              <FormControlLabel
                sx={{ margin: 0, '& > span': { marginRight: theme => theme.spacing(2) } }}
                labelPlacement="start"
                control={<FormikSelect name="displayLocation" values={calloutsGroups} />}
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
