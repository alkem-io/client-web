import { AiPersonaModelCardModel } from '../model/AiPersonaModelCardModel';
import { AiPersonaModelCardEntry, AiPersonaModelCardEntryFlagName } from '@/core/apollo/generated/graphql-schema';

export const useTemporaryHardCodedVCProfilePageData = (modelCard: AiPersonaModelCardModel) => {
  // TODO: the logic here should be isGeneric, isAssistant and isExternal = isGeneric || isAssistant;
  const isExternal = modelCard.aiEngine.isExternal;
  const isAssistant = modelCard.aiEngine.isAssistant;
  const isExternal_OR_Assistant = isExternal || isAssistant;

  return {
    sections: {
      functionality: {
        title: 'Functionality',
        cells: modelCard.spaceUsage
          .map(usage => {
            switch (usage.modelCardEntry) {
              case AiPersonaModelCardEntry.SpaceCapabilities:
                return {
                  icon: 'functionalCapabilities',
                  title: 'Functional Capabilities',
                  bullets: usage.flags.map(flag => ({
                    icon: flag.enabled ? 'check' : '',
                    text:
                      flag.name === AiPersonaModelCardEntryFlagName.SpaceCapabilityTagging
                        ? 'Answer questions in comments'
                        : flag.name === AiPersonaModelCardEntryFlagName.SpaceCapabilityCreateContent
                          ? 'Create new posts'
                          : flag.name === AiPersonaModelCardEntryFlagName.SpaceCapabilityCommunityManagement
                            ? 'Invite other contributors'
                            : flag.name,
                  })),
                };
              case AiPersonaModelCardEntry.SpaceDataAccess:
                return {
                  icon: 'cloudUpload',
                  title: 'Data access from the Space where it is a member',
                  bullets: usage.flags.map(flag => ({
                    icon: flag.enabled ? 'check' : '',
                    text:
                      flag.name === AiPersonaModelCardEntryFlagName.SpaceDataAccessAbout
                        ? 'About page'
                        : flag.name === AiPersonaModelCardEntryFlagName.SpaceDataAccessContent
                          ? 'Posts & Contributions'
                          : flag.name === AiPersonaModelCardEntryFlagName.SpaceDataAccessSubspaces
                            ? 'Subspaces'
                            : flag.name,
                  })),
                };
              case AiPersonaModelCardEntry.SpaceRoleRequired:
                return {
                  icon: 'shieldPerson',
                  title: 'Role Requirements',
                  description: usage.flags.some(
                    flag => flag.name === AiPersonaModelCardEntryFlagName.SpaceRoleMember && flag.enabled
                  )
                    ? 'This VC needs to be granted <strong>member rights</strong> to function correctly'
                    : 'No special member rights required',
                };
              default:
                return null;
            }
          })
          .filter(Boolean),
      },

      aiEngine: {
        title: `AI Engine: ${isExternal ? 'External AI' : isAssistant ? 'External AI Assistant' : 'Alkemio AI '}`,
        cells: [
          {
            icon: 'settingsMotion',
            title: ' Open Model Transparency',
            description: 'Does the VC use an open-weight model?',
            answerIcon: modelCard.aiEngine.isUsingOpenWeightsModel ? 'exclamation' : 'check',
            answer: modelCard.aiEngine.isUsingOpenWeightsModel ? 'No' : 'Yes',
          },
          {
            icon: 'database',
            title: 'Data Usage Disclosure',
            description: 'Is interaction data used in any way for model training?',
            answerIcon: modelCard.aiEngine.isInteractionDataUsedForTraining ? 'exclamation' : 'check',
            answer: modelCard.aiEngine.isInteractionDataUsedForTraining ? 'Unknown' : 'No',
          },
          {
            icon: 'knowledge',
            title: 'Knowledge Restriction',
            description: 'Is the VC prompted to limit the responses to a specific body of knowledge?',
            answerIcon: isExternal_OR_Assistant ? 'exclamation' : 'check',
            answer: modelCard.aiEngine.areAnswersRestrictedToBodyOfKnowledge,
          },
          {
            icon: 'globe',
            title: 'Web Access',
            description: 'Can the VC access or search the web?',
            answerIcon: modelCard.aiEngine.canAccessWebWhenAnswering ? 'check' : 'exclamation',
            answer: modelCard.aiEngine.canAccessWebWhenAnswering ? 'Yes' : 'No',
          },
          {
            icon: 'location',
            title: 'Physical Location',
            description: 'Where is the AI service hosted?',
            answer: modelCard.aiEngine.hostingLocation,
          },
          {
            icon: 'techReferences',
            title: 'Technical References',
            description: 'Access to detailed information on the underlying models specifications',
            buttonIcon: 'launch',
            buttonText: 'SEE DOCUMENTATION',
            to: modelCard.aiEngine.additionalTechnicalDetails,
          },
        ],
      },

      monitoring: {
        title: 'Monitoring by Alkemio',
        description:
          'Since Alkemio facilitates the interaction with the external provider, it holds an operational responsibility to monitor the service. As with all data and interactions on the platform, these are governed by our <a href="https://welcome.alkem.io/legal/#tc" target="_blank" ref="noreferer">Terms & Conditions</a>.',
      },
    },
  };
};
