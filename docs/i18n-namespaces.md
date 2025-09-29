# Translation System Documentation

This document describes the updated translation system that splits the monolithic translation file into focused namespace files.

## Overview

The translation system has been updated to use multiple namespace files instead of a single large `translation.en.json` file. This provides better organization, easier maintenance, and improved collaboration for translators.

## Namespace Structure

Translations are now organized into the following namespaces:

### Core Platform Features
- **common**: Common UI elements, buttons, fields, actions, apollo, languages
- **authentication**: Authentication flows, Kratos integration
- **navigation**: Navigation menus, top bar, footer
- **messaging**: Messaging features, dialogs, snackbars

### Domain-Specific Features
- **spaces**: Space creation, management, search, filtering
- **community**: Community features, associates, contributors
- **collaboration**: Callouts, contributions, discussions, updates
- **innovation**: Innovation editing, templates, innovation hub
- **templates**: Template management, library, plans
- **credentials**: Credential management

### UI Components
- **components**: Generic UI components, visuals, tooltips
- **forms**: Form-related translations
- **dialogs**: Dialog boxes, modals

### Utilities and Misc
- **calendar**: Calendar-related translations
- **operations**: System operations
- **pages**: Page-specific content (largest namespace)
- **context**: Context-related translations

### Specific Features
- **virtualContributor**: Virtual contributor features
- **chatbot**: Chatbot functionality
- **platform**: Platform-wide features (release notes, cookies)

## File Structure

```
src/core/i18n/
├── en/
│   ├── namespaces/
│   │   ├── common.json
│   │   ├── authentication.json
│   │   ├── navigation.json
│   │   ├── messaging.json
│   │   ├── spaces.json
│   │   ├── community.json
│   │   ├── collaboration.json
│   │   ├── innovation.json
│   │   ├── templates.json
│   │   ├── credentials.json
│   │   ├── components.json
│   │   ├── forms.json
│   │   ├── dialogs.json
│   │   ├── calendar.json
│   │   ├── operations.json
│   │   ├── pages.json
│   │   ├── context.json
│   │   ├── virtualContributor.json
│   │   ├── chatbot.json
│   │   └── platform.json
│   └── translation.en.json (legacy, for backward compatibility)
├── es/
│   ├── namespaces/
│   │   └── [same structure as en/]
│   └── translation.es.json (legacy)
└── [other languages follow same pattern]
```

## Usage in Code

### Importing Translations

The default namespace is `common`, so basic translations work as before:

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation(); // Uses 'common' namespace by default
const buttonText = t('buttons.save'); // Translates from common namespace
```

### Using Specific Namespaces

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation('spaces'); // Use 'spaces' namespace
const createSpaceText = t('createSpace.title');

// Or use multiple namespaces
const { t: tCommon } = useTranslation('common');
const { t: tSpaces } = useTranslation('spaces');
```

### TypeScript Support

The namespace types are defined in `src/core/i18n/namespaces.ts`:

```typescript
import { namespaces, NamespaceKey, NamespaceValue } from '@/core/i18n/namespaces';
```

## Crowdin Integration

The Crowdin configuration has been updated to handle multiple namespace files:

- Each namespace file is configured as a separate source file
- Crowdin will manage translations for each namespace independently
- Translation updates will be applied to the appropriate namespace file
- The legacy monolithic file is kept for backward compatibility during transition

## Migration Guide

### For Developers

1. **Existing Code**: No immediate changes required. The system maintains backward compatibility.
2. **New Code**: Use specific namespaces when possible for better organization.
3. **Refactoring**: Gradually migrate to use specific namespaces instead of the default.

### For Translators

1. **Crowdin Interface**: You'll now see translations organized by feature/namespace
2. **Context**: Better context for translations as they're grouped by functionality
3. **Workflow**: Same translation workflow, but with more focused files

## Benefits

1. **Better Organization**: Translations grouped by feature/domain
2. **Easier Maintenance**: Smaller, focused files are easier to navigate
3. **Reduced Conflicts**: Multiple team members can work on different areas simultaneously
4. **Better Performance**: Lazy loading of only needed namespaces
5. **Improved Context**: Translators have better context for their work
6. **Scalability**: Easy to add new namespaces as features grow

## Backward Compatibility

- The legacy `translation.*.json` files are maintained for backward compatibility
- Existing code using the default namespace continues to work
- Gradual migration path allows for smooth transition
- Crowdin continues to work with both old and new file structures