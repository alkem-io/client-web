import {
  CalloutContributionType,
  CalloutFramingType,
  MediaGallery,
  UpdateLinkInput,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
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
import { WhiteboardPreviewSettings } from '../../whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import { uniqBy } from 'lodash';

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
        previewSettings: WhiteboardPreviewSettings;
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
      mediaGallery?: MediaGallery;
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
              visuals: mapWhiteboardVisuals(calloutTemplate.framing.whiteboard.profile), // Visuals coming from the template
            },
            content: calloutTemplate.framing.whiteboard.content,
            previewImages: [], // Used to store the visuals generated if the whiteboard is edited
            previewSettings: calloutTemplate.framing.whiteboard.previewSettings,
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
      mediaGallery: calloutTemplate.framing.mediaGallery
        ? {
            visuals:
              calloutTemplate.framing.mediaGallery.visuals?.map(v => ({
                id: v.id,
                uri: v.uri,
                name: v.alternativeText || '',
              })) ?? [],
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
    // TODO: Add restriction handling for MediaGallery if needed
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

const mapWhiteboardVisuals = (profile: {
  visuals?: VisualModel[];
  visual?: VisualModel;
  preview?: VisualModel;
}): { name: VisualType; uri: string }[] => {
  const result: { name: VisualType; uri: string }[] = [];
  if (profile.visuals) {
    profile.visuals.forEach(v => {
      if (v.uri) {
        result.push({ name: v.name as VisualType, uri: v.uri });
      }
    });
  }
  if (profile.visual) {
    result.push({ name: profile.visual.name as VisualType, uri: profile.visual.uri });
  }
  if (profile.preview) {
    result.push({ name: profile.preview.name as VisualType, uri: profile.preview.uri });
  }
  // Only visuals with uri and unique uris
  return uniqBy(
    result.filter(item => item.uri),
    item => item.uri
  );
};
