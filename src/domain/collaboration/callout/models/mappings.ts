import { CalloutContributionType, CalloutFramingType, UpdateLinkInput } from '@/core/apollo/generated/graphql-schema';
import { CalloutFormSubmittedValues, DefaultCalloutFormValues } from '../../callout/CalloutForm/CalloutFormModel';
import { CalloutSettingsModelFull } from './CalloutSettingsModel';
import { VisualModel } from '@/domain/common/visual/model/VisualModel';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { ProfileModel } from '@/domain/common/profile/ProfileModel';
import { mapTagsetModelToTagsFormValues } from '@/domain/common/tagset/TagsetUtils';
import { mapReferenceModelToReferenceFormValues } from '@/domain/common/reference/ReferenceUtils';
import { mapContributionDefaultsModelToCalloutFormValues } from './ContributionDefaultsModel';
import { CalloutRestrictions } from '../CalloutRestrictionsTypes';
import { LinkDetails } from '../../calloutContributions/link/models/LinkDetails';

export const mapCalloutTemplateToCalloutForm = (
  calloutTemplate?: {
    framing: {
      type: CalloutFramingType;
      profile: ProfileModel & {
        defaultTagset?: TagsetModel;
      };
      whiteboard?: {
        content: string;
        profile: ProfileModel & {
          preview?: VisualModel;
        };
      };
      memo?: {
        profile: ProfileModel & {
          preview?: VisualModel;
        };
        markdown?: string;
      };
      link?: {
        uri: string;
        profile: {
          displayName: string;
        };
      };
    };
    settings: CalloutSettingsModelFull;
    contributionDefaults: {
      defaultDisplayName?: string | undefined;
      postDescription?: string | undefined;
      whiteboardContent?: string | undefined;
    };
  },
  calloutRestrictions?: CalloutRestrictions
): CalloutFormSubmittedValues | undefined => {
  if (!calloutTemplate) {
    return undefined;
  } else {
    const templateProfile: CalloutFormSubmittedValues['framing']['profile'] = {
      displayName: calloutTemplate.framing.profile.displayName ?? DefaultCalloutFormValues.framing.profile.displayName,
      description: calloutTemplate.framing.profile.description ?? DefaultCalloutFormValues.framing.profile.description,
      tagsets:
        calloutTemplate.framing.profile.tagsets?.map(mapTagsetModelToTagsFormValues) ??
        DefaultCalloutFormValues.framing.profile.tagsets,
      references:
        calloutTemplate.framing.profile.references?.map(mapReferenceModelToReferenceFormValues) ??
        DefaultCalloutFormValues.framing.profile.references,
    };
    const templateFraming: CalloutFormSubmittedValues['framing'] = {
      type: calloutTemplate.framing.type,
      profile: templateProfile,
      whiteboard: calloutTemplate.framing.whiteboard
        ? {
            profile: {
              displayName: calloutTemplate.framing.whiteboard.profile.displayName,
            },
            content: calloutTemplate.framing.whiteboard.content,
            previewImages: [], // TODO: Download the preview images if available
          }
        : undefined,
      memo: calloutTemplate.framing.memo
        ? {
            profile: {
              displayName: calloutTemplate.framing.memo.profile.displayName,
            },
            markdown: calloutTemplate.framing.memo.markdown,
          }
        : undefined,
      link: calloutTemplate.framing.link
        ? {
            uri: calloutTemplate.framing.link.uri,
            profile: {
              displayName: calloutTemplate.framing.link.profile.displayName,
            },
          }
        : undefined,
    };
    const templateContributionDefaults =
      mapContributionDefaultsModelToCalloutFormValues(calloutTemplate.contributionDefaults) ??
      DefaultCalloutFormValues.contributionDefaults;

    const templateSettings = mapCalloutSettingsModelToCalloutSettingsFormValues(calloutTemplate.settings);

    if (calloutRestrictions?.disableWhiteboards && templateFraming.type === CalloutFramingType.Whiteboard) {
      templateFraming.type = CalloutFramingType.None;
      templateFraming.whiteboard = undefined;
    }
    if (calloutRestrictions?.disableMemos && templateFraming.type === CalloutFramingType.Memo) {
      templateFraming.type = CalloutFramingType.None;
      templateFraming.memo = undefined;
    }
    if (
      calloutRestrictions?.disableWhiteboards &&
      templateSettings.contribution.allowedTypes === CalloutContributionType.Whiteboard
    ) {
      templateSettings.contribution.allowedTypes = 'none';
      templateContributionDefaults.whiteboardContent = undefined;
    }
    if (calloutRestrictions?.disableComments) {
      templateSettings.contribution.commentsEnabled = false;
      templateSettings.framing.commentsEnabled = false;
    }

    return {
      framing: templateFraming,
      contributionDefaults: templateContributionDefaults,
      settings: templateSettings,
      contributions: {
        links: [],
      },
    };
  }
};

export const mapCalloutSettingsFormToCalloutSettingsModel = (
  settings: CalloutFormSubmittedValues['settings']
): CalloutSettingsModelFull => ({
  contribution: {
    enabled: settings.contribution.enabled,
    allowedTypes:
      settings.contribution.allowedTypes === 'none'
        ? []
        : // Sometimes, when the data is coming from a template, this allowedTypes is already an array
          Array.isArray(settings.contribution.allowedTypes)
          ? settings.contribution.allowedTypes
          : [settings.contribution.allowedTypes],
    canAddContributions: settings.contribution.canAddContributions,
    commentsEnabled: settings.contribution.commentsEnabled,
  },
  framing: {
    commentsEnabled: settings.framing.commentsEnabled,
  },
  visibility: settings.visibility,
});

export const mapCalloutSettingsModelToCalloutSettingsFormValues = (
  settings: CalloutSettingsModelFull
): CalloutFormSubmittedValues['settings'] => ({
  contribution: {
    enabled: settings.contribution.enabled,
    allowedTypes: settings.contribution.allowedTypes.length > 0 ? settings.contribution.allowedTypes[0] : 'none',
    canAddContributions: settings.contribution.canAddContributions,
    commentsEnabled: settings.contribution.commentsEnabled,
  },
  framing: {
    commentsEnabled: settings.framing.commentsEnabled,
  },
  visibility: settings.visibility,
});

export const mapCalloutSettingsFormToCalloutUpdateSettings = (
  settings: CalloutFormSubmittedValues['settings'] | undefined
) =>
  settings
    ? {
        contribution: {
          enabled: settings.contribution.enabled,
          // allowedTypes: // Read only for now
          canAddContributions: settings.contribution.canAddContributions,
          commentsEnabled: settings.contribution.commentsEnabled,
        },
        framing: {
          commentsEnabled: settings.framing.commentsEnabled,
        },
        visibility: settings.visibility,
      }
    : undefined;

export const mapLinkDataToUpdateLinkInput = (linkData: LinkDetails | undefined): UpdateLinkInput | undefined => {
  if (!linkData) {
    return undefined;
  }

  return {
    ID: linkData.id ?? '', // the same model used for creation and update
    uri: linkData.uri,
    profile: {
      displayName: linkData.profile.displayName,
      description: linkData.profile.description,
    },
  };
};
