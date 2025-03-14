import { AiPersonaEngine } from '@/core/apollo/generated/graphql-schema';

export const useTemporaryHardCodedVCProfilePageData = (type: AiPersonaEngine = AiPersonaEngine.GenericOpenai) => {
  // TODO: the logic here should be isGeneric, isAssistant and isExternal = isGeneric || isAssistant;
  const isExternal = type === AiPersonaEngine.GenericOpenai;
  const isAssistant = type === AiPersonaEngine.OpenaiAssistant;
  const isExternal_OR_Assistant = isExternal || isAssistant;

  return {
    sections: {
      functionality: {
        title: 'Functionality',
        cells: [
          {
            icon: 'functionalCapabilities',
            title: 'Functional Capabilities',
            bullets: [
              {
                icon: 'check',
                text: 'Answer questions in comments',
              },
              {
                icon: '',
                text: 'Create new posts',
              },
              {
                icon: '',
                text: 'Invite other contributors',
              },
            ],
          },
          {
            icon: 'cloudUpload',
            title: 'Data access from the Space where it’s a member',
            bullets: [
              {
                icon: 'check',
                text: 'About page',
              },
              {
                icon: '',
                text: 'Posts & Contributions',
              },
              {
                icon: '',
                text: 'Subspaces',
              },
            ],
          },
          {
            icon: 'shieldPerson',
            title: 'Role Requirements',
            description: 'This VC needs to be granted <strong>member rights</strong> to function correctly',
          },
        ],
      },

      aiEngine: {
        title: `AI Engine: ${isExternal ? 'External AI' : isAssistant ? 'External AI Assistant' : 'Alkemio AI '}`,
        cells: [
          {
            icon: 'settingsMotion',
            title: ' Open Model Transparency',
            description: 'Does the VC use an open-weight model?',
            answerIcon: isExternal_OR_Assistant ? 'exclamation' : 'check',
            answer: isExternal_OR_Assistant ? 'No' : 'Yes',
          },
          {
            icon: 'database',
            title: 'Data Usage Disclosure',
            description: 'Is interaction data used in any way for model training?',
            answerIcon: isExternal_OR_Assistant ? 'exclamation' : 'check',
            answer: isExternal_OR_Assistant ? 'Unknown' : 'No',
          },
          {
            icon: 'knowledge',
            title: 'Knowledge Restriction',
            description: 'Is the VC prompted to limit the responses to a specific body of knowledge?',
            answerIcon: isExternal_OR_Assistant ? 'exclamation' : 'check',
            answer: (() => {
              switch (type) {
                case AiPersonaEngine.GenericOpenai:
                  return 'No';
                case AiPersonaEngine.OpenaiAssistant:
                  return 'Yes, when provided';
                default:
                  return 'Yes';
              }
            })(),
          },
          {
            icon: 'globe',
            title: 'Web Access',
            description: 'Can the VC access or search the web?',
            answerIcon: isExternal ? 'check' : 'exclamation',
            answer: isExternal ? 'Yes' : 'No',
          },
          {
            icon: 'location',
            title: 'Physical Location',
            description: 'Where is the AI service hosted?',
            answer: isExternal_OR_Assistant ? 'Unknown' : 'Sweden, EU',
          },
          {
            icon: 'techReferences',
            title: 'Technical References',
            description: 'Access to detailed information on the underlying models specifications',
            buttonIcon: 'launch',
            buttonText: 'SEE DOCUMENTATION',
            to: isExternal
              ? 'https://platform.openai.com/docs/overview'
              : isAssistant
              ? 'https://platform.openai.com/docs/assistants/overview'
              : 'https://huggingface.co/mistralai/Mistral-Small-Instruct-2409/tree/main',
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
