import { CalloutFormSubmittedValues, DefaultCalloutFormValues } from '../../callout/CalloutForm/CalloutFormModel';
import { CalloutModel } from './CalloutModel';
import { CalloutSettingsModelFull } from './CalloutSettingsModel';

export const mapCalloutModelToCalloutForm = (
  callout: Pick<CalloutModel, 'framing' | 'contributionDefaults' | 'settings'> | undefined
): CalloutFormSubmittedValues | undefined => {
  if (!callout) {
    return undefined;
  } else {
    return {
      framing: {
        ...DefaultCalloutFormValues.framing,
        ...callout.framing,
        profile: {
          ...DefaultCalloutFormValues.framing.profile,
          ...callout.framing.profile,
        },
      },
      contributionDefaults: {
        ...DefaultCalloutFormValues.contributionDefaults,
        ...callout.contributionDefaults,
      },
      settings: mapCalloutSettingsModelToCalloutSettingsFormValues(callout?.settings),
    } as CalloutFormSubmittedValues;
  }
};

export const mapCalloutSettingsFormToCalloutSettingsModel = (
  settings: CalloutFormSubmittedValues['settings']
): CalloutSettingsModelFull => ({
  contribution: {
    enabled: settings.contribution.enabled,
    allowedTypes: settings.contribution.allowedTypes === 'none' ? [] : [settings.contribution.allowedTypes],
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
