import {
  VirtualContributorModelCardEntry,
  VirtualContributorModelCardEntryFlagName,
} from '@/core/apollo/generated/graphql-schema';
import { VirtualContributorModelCard } from '../model/VirtualContributorModelCardModel';

export const useTemporaryHardCodedVCProfilePageData = (modelCard: VirtualContributorModelCard) => {
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
              case VirtualContributorModelCardEntry.SpaceCapabilities:
                return {
                  icon: 'functionalCapabilities',
                  title: 'Functional Capabilities',
                  bullets: usage.flags.map(flag => ({
                    icon: flag.enabled ? 'check' : '',
                    text:
                      flag.name === VirtualContributorModelCardEntryFlagName.SpaceCapabilityTagging
                        ? 'Answer questions in comments'
                        : flag.name === VirtualContributorModelCardEntryFlagName.SpaceCapabilityCreateContent
                          ? 'Create new posts'
                          : flag.name === VirtualContributorModelCardEntryFlagName.SpaceCapabilityCommunityManagement
                            ? 'Invite other contributors'
                            : flag.name,
                  })),
                };
              case VirtualContributorModelCardEntry.SpaceDataAccess:
                return {
                  icon: 'cloudUpload',
                  title: 'Data access from the Space where it is a member',
                  bullets: usage.flags.map(flag => ({
                    icon: flag.enabled ? 'check' : '',
                    text:
                      flag.name === VirtualContributorModelCardEntryFlagName.SpaceDataAccessAbout
                        ? 'About page'
                        : flag.name === VirtualContributorModelCardEntryFlagName.SpaceDataAccessContent
                          ? 'Posts & Contributions'
                          : flag.name === VirtualContributorModelCardEntryFlagName.SpaceDataAccessSubspaces
                            ? 'Subspaces'
                            : flag.name,
                  })),
                };
              case VirtualContributorModelCardEntry.SpaceRoleRequired:
                return {
                  icon: 'shieldPerson',
                  title: 'Role Requirements',
                  description: usage.flags.some(
                    flag => flag.name === VirtualContributorModelCardEntryFlagName.SpaceRoleMember && flag.enabled
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
            answerIcon: modelCard.aiEngine.isInteractionDataUsedForTraining === false ? 'check' : 'exclamation', // making sure null evaluates to exclamation
            answer: modelCard.aiEngine.isInteractionDataUsedForTraining === false ? 'No' : 'Unknown', // making sure null evaluates to Unknown
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
