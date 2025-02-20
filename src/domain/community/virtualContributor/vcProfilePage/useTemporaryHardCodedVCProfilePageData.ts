export const useTemporaryHardCodedVCProfilePageData = () => {
  return {
    // WIP ~ #7170 - Виж от къде можеш да ги вземеш
    references: [],

    // WIP ~ #7170 - Виж от къде можеш да го вземеш
    bodyOfKnowledge: {},

    // WIP ~ #7170 - Виж от къде можеш да го вземеш
    bodyOfKnowledgeFromSpace: {},

    sections: {
      functionality: {
        title: 'Functionality',
        cells: [
          {
            icon: '',
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
            icon: 'check',
            title: 'Data access from the Space where it’s a member',
            bullets: [
              {
                icon: '',
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
            icon: '',
            title: 'Role Requirements',
            description: 'This VC needs to be granted <strong>member rights</strong> to function correctly',
          },
        ],
      },

      aiEngine: {
        title: 'AI Engine: Alkemio AI Engine',
        cells: [
          {
            title: ' Open Model Transparency',
            description: 'Does the VC use an open-weight model?',
            answer: 'Yes',
          },
          {
            title: 'Data Usage Disclosure',
            description: 'Is interaction data used in any way for model training?',
            answer: 'Yes',
          },
          {
            title: 'Knowledge Restriction',
            description: 'Is the VC prompted to limit the responses to a specific body of knowledge?',
            answer: 'Yes',
          },
          {
            title: 'Web Access',
            description: 'Can the VC access or search the web?',
            answer: 'Yes',
          },
          {
            title: 'Physical Location',
            description: 'Where is the AI service hosted?',
            answer: 'Unknown',
          },
          {
            title: 'Technical References',
            description: 'Access to detailed information on the underlying models specifications',
            buttonText: 'SEE DOCUMENTATION',
          },
        ],
      },

      monitoring: {
        title: 'Monitoring by Alkemio',
        description:
          'Since Alkemio facilitates the interaction with the external provider, it holds an operational responsibility to monitor the service. As with all data and interactions on the platform, these are governed by our Terms & Conditions.',
      },
    },
  };
};
