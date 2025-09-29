// Namespace definitions for split translation files
export const namespaces = {
  // Core platform features
  common: 'common',
  authentication: 'authentication',
  navigation: 'navigation', 
  messaging: 'messaging',
  
  // Domain-specific features
  spaces: 'spaces',
  community: 'community',
  collaboration: 'collaboration',
  innovation: 'innovation',
  templates: 'templates',
  credentials: 'credentials',
  
  // UI Components
  components: 'components',
  forms: 'forms',
  dialogs: 'dialogs',
  
  // Utilities and misc
  calendar: 'calendar',
  operations: 'operations',
  pages: 'pages',
  context: 'context',
  
  // Specific features
  virtualContributor: 'virtualContributor',
  chatbot: 'chatbot',
  platform: 'platform'
} as const;

export type NamespaceKey = keyof typeof namespaces;
export type NamespaceValue = typeof namespaces[NamespaceKey];

// Mapping of old translation keys to new namespaces
export const keyToNamespaceMapping: Record<string, NamespaceValue> = {
  // Common
  'common': 'common',
  'buttons': 'common',
  'fields': 'common',
  'actions': 'common',
  'apollo': 'common',
  'languages': 'common',
  
  // Authentication
  'authentication': 'authentication',
  'kratos': 'authentication',
  
  // Navigation
  'navigation': 'navigation',
  'topBar': 'navigation',
  'footer': 'navigation',
  
  // Messaging
  'messaging': 'messaging',
  'send-message-dialog': 'messaging',
  'snackbars': 'messaging',
  
  // Spaces
  'createSpace': 'spaces',
  'space-creation': 'spaces',
  'spaceDialog': 'spaces',
  'spaceSearch': 'spaces',
  'spaces-filter': 'spaces',
  
  // Community
  'community': 'community',
  'dashboard-community-section': 'community',
  'associates-view': 'community',
  'associated-organizations-view': 'community',
  'contributors-section': 'community',
  'dashboard-contributors-section': 'community',
  
  // Collaboration
  'callout': 'collaboration',
  'contributions-view': 'collaboration',
  'dashboard-discussions-section': 'collaboration',
  'dashboard-updates-section': 'collaboration',
  'post-edit': 'collaboration',
  
  // Innovation
  'innovation-edit': 'innovation',
  'innovation-templates': 'innovation',
  'innovationHub': 'innovation',
  
  // Templates
  'templateDialog': 'templates',
  'templateLibrary': 'templates',
  'plansTable': 'templates',
  
  // Credentials
  'credentials-view': 'credentials',
  
  // Components
  'components': 'components',
  'visuals-alt-text': 'components',
  'tooltips': 'components',
  
  // Forms
  'forms': 'forms',
  
  // Dialogs
  'aboutDialog': 'dialogs',
  'share-dialog': 'dialogs',
  
  // Calendar
  'calendar': 'calendar',
  
  // Operations
  'operations': 'operations',
  
  // Pages
  'pages': 'pages',
  
  // Context
  'context': 'context',
  
  // Virtual Contributor
  'createVirtualContributorWizard': 'virtualContributor',
  'virtualContributorSpaceSettings': 'virtualContributor',
  
  // Chatbot
  'chatbot': 'chatbot',
  
  // Platform
  'releaseNotes': 'platform',
  'cookie': 'platform'
};