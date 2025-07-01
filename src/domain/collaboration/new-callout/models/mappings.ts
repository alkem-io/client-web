import { CalloutFormSubmittedValues } from '../CreateCallout/CalloutFormModel';
import { CalloutSettingsModelFull } from './CalloutSettingsModel';

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
