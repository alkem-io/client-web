# Space Domain Component Overview

This document provides an overview of the components in the domain/space directory and their relationships.

## Core Components

### Context and State Management

- **SpaceContextProvider** (`context/SpaceContext.tsx`): Provides space data to all child components.
- **useSpace** (`context/useSpace.tsx`): Hook to access space data from the SpaceContextProvider.
- **useSubSpace** (`hooks/useSubSpace.tsx`): Hook for accessing subspace data.

### Layout Components

- **EntityPageLayout** (`layout/EntityPageLayout.tsx`): Base layout for space-related pages.
- **SpaceSkeletonLayout** (`layout/loadingLayout/SpaceSkeletonLayout.tsx`): Loading layout for spaces.
- **SpacePageLayout** (`layout/tabbedLayout/layout/SpacePageLayout.tsx`): Layout for space pages with tabs.
- **SpacePageBanner** (`layout/tabbedLayout/layout/SpacePageBanner.tsx`): Banner component for space pages.
- **SubspacePageLayout** (`layout/flowLayout/SubspacePageLayout.tsx`): Layout for subspace pages.

### Navigation Components

- **SpaceTabs** (`layout/tabbedLayout/Tabs/SpaceTabs.tsx`): Tab navigation for spaces.
- **SubspaceInnovationFlow** (`layout/flowLayout/SubspacePageLayout.tsx`): Flow navigation for subspaces.
- **JourneyBreadcrumbs** (`components/journeyBreadcrumbs/JourneyBreadcrumbs.tsx`): Breadcrumb navigation for spaces.

## Page Components

### Space Pages

- **SpaceAboutPage** (`about/SpaceAboutPage.tsx`): Page displaying space details.
- **SpaceDashboardPage** (`layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardPage.tsx`): Dashboard page for spaces.
- **SpaceSubspacesPage** (`layout/tabbedLayout/Tabs/SpaceSubspacesPage.tsx`): Page displaying subspaces within a space.

### Subspace Pages

- **SubspaceAboutPage** (`about/SubspaceAboutPage.tsx`): Page displaying subspace details.

## Dialog Components

- **SpaceAboutDialog** (`about/SpaceAboutDialog.tsx`): Dialog for displaying space/subspace about information.
- **CreateSpaceDialog** (`createSpace/CreateSpaceDialog.tsx`): Dialog for creating new spaces.
- **SubspaceDialogs** (`components/SubspaceComponents/SubspaceDialogs.tsx`): Various dialogs used within subspaces.
- **JourneyCreationDialog** (`components/SubspaceCreationDialog/SubspaceCreationDialog.tsx`): Dialog for creating subspaces.

## Admin Components

- **SpaceAccountView** (`admin/SpaceAccount/SpaceAccountView.tsx`): Admin view for space account management.
- **SpaceAboutView** (`admin/SpaceAboutSettings/SpaceAboutView.tsx`): Admin view for editing space about information.
- **OpportunitySettingsView** (`admin/OpportunitySettings/OpportunitySettingsView.tsx`): Settings view for opportunities.
- **AdminOpportunityCommunityPage** (`admin/AdminOpportunityCommunityPage.tsx`): Admin page for community management.
- **OpportunityList** (`admin/OpportunityList.tsx`): Component for listing opportunities.

## Card Components

- **JourneyCard** (`components/JourneyCard/JourneyCard.tsx`): Card component for displaying spaces/journeys.
- **SubspaceCard** (`components/SubspaceCard.tsx`): Card component for displaying subspaces.
- **SearchBaseJourneyCard** (`shared/components/search-cards/base/SearchBaseJourneyCard.tsx`): Base card for search results.

## Form Components

- **SpaceAboutForm** (`about/settings/SpaceAboutForm.tsx`): Form for editing space about information.
- **CreateSubspaceForm** (`components/CreateSubspaceForm.tsx`): Form for creating subspaces.

## Routing Components

- **SpaceRoute** (`routing/SpaceRoute.tsx`): Main route component for spaces.
- **SubspaceRoute** (`routing/SubspaceRoute.tsx`): Route component for subspaces.
- **SpaceSettingsRoute** (`routing/toReview2/SpaceSettingsRoute.tsx`): Route for space settings.

## Component Relationships

1. **Context Hierarchy**:

   - `SpaceContextProvider` → provides data to → `useSpace` hook → consumed by space components

2. **Page Structure**:

   - `SpaceRoute` → renders → `EntityPageLayout` → contains → `SpaceTabsPlaceholder` and page content
   - `SubspaceRoute` → renders → `SubspacePageLayout` → contains subspace content

3. **Admin Structure**:

   - Admin pages use `SpaceAboutView`, `SpaceAccountView`, etc. for different settings sections
   - Admin components rely on context from `useSpace` or `useSubSpace`

4. **Dialog Flow**:

   - `SpaceAboutPage` → opens → `SpaceAboutDialog`
   - `SubspaceAboutPage` → opens → `SpaceAboutDialog` (reused for subspaces)

5. **Creation Flow**:

   - `CreateSpaceDialog` → handles space creation
   - `JourneyCreationDialog` → uses → `CreateSubspaceForm` → for subspace creation

6. **Card Usage**:

   - `ChildJourneyView` → renders → `SubspaceCard`s or `JourneyCard`s
   - Search results use → `SearchBaseJourneyCard`

7. **Navigation Components**:
   - `SpaceTabs` → used in → `SpacePageLayout`
   - `JourneyBreadcrumbs` → used across space and subspace pages

## Code Duplication Analysis

### Component Similarity Assessment

| Component Category           | Similarity Level | Notes                                                     |
| ---------------------------- | ---------------- | --------------------------------------------------------- |
| Context and State Management | Low              | Different purpose for Space vs Subspace                   |
| Layout Components            | High             | Significant overlap between layouts                       |
| Page Components              | Very High        | SpaceAboutPage and SubspaceAboutPage are nearly identical |
| Dialog Components            | Medium to High   | SpaceAboutDialog reused across contexts                   |
| Admin Components             | Medium           | Share layout patterns but different functionality         |
| Card Components              | Very High        | Significant code duplication                              |
| Form Components              | Medium           | Share field patterns and validation                       |

### Refactoring Recommendations

1. **Combine About Pages**

   - Create a unified `JourneyAboutPage` component that handles both Space and Subspace
   - Use props to differentiate behavior

2. **Create Card Component Hierarchy**

   - Develop a `BaseJourneyCard` that all card variants extend
   - Remove duplicate styling and structure code

3. **Consolidate Layout Components**

   - Create a flexible `JourneyPageLayout` for both Space and Subspace cases
   - Use composition for content areas that can be filled differently

4. **Simplify Dialog Components**
   - Create a common `EntityCreationDialog` pattern
   - Review `SubspaceDialogs` for unused functionality
