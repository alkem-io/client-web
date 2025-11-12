# Feature Specification: Fix Callout Icon Display

**Feature Branch**: `001-fix-callout-icons`
**Created**: November 12, 2025
**Status**: Clarified
**Input**: User description: "Fix callout icon display to dynamically reflect content type and response options based on Figma design"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Visual Callout Type Recognition (Priority: P1)

Users need to quickly identify the type of callout (post, response option, or additional content) by glancing at its icon, enabling faster navigation and understanding of the platform's content structure.

**Why this priority**: Core visual affordance that directly impacts user comprehension and efficiency. Without correct icons, users cannot distinguish between different callout types, creating confusion and reducing platform usability.

**Independent Test**: Can be fully tested by viewing any page with callouts (e.g., Preview, Manage Flow, Template dialogs) and verifying the icon matches the callout's content type and response configuration.

**Acceptance Scenarios**:

1. **Given** a callout with no additional content and no response options, **When** user views the callout, **Then** a "Post" icon is displayed at 20px size
2. **Given** a callout with no additional content but has response options, **When** user views the callout, **Then** an icon matching the response option type is displayed at 20px size
3. **Given** a callout with additional content (framing) and no response options, **When** user views the callout, **Then** an icon matching the additional content type is displayed at 20px size
4. **Given** a callout with both additional content (framing) and response options, **When** user views the callout, **Then** an icon matching the additional content type is displayed at 20px size (content takes precedence)

---

### User Story 2 - Response Indicator Preservation (Priority: P1)

Users need to see when a callout has received responses while also understanding the callout type, ensuring they don't miss important interactions or discussions.

**Why this priority**: Critical for engagement and community interaction. The "(n)" marker is an essential affordance that indicates active discussions users should review.

**Independent Test**: Can be fully tested by creating callouts with and without responses and verifying the "(n)" marker appears correctly alongside the appropriate icon.

**Acceptance Scenarios**:

1. **Given** a callout with 3 responses, **When** user views the callout, **Then** the "(3)" marker is displayed alongside the correct icon type
2. **Given** a callout with no responses, **When** user views the callout, **Then** no "(n)" marker is displayed, only the icon
3. **Given** a callout that receives a new response, **When** the list refreshes, **Then** the "(n)" counter increments while maintaining the correct icon

---

### User Story 3 - Contextual Icon Tooltips (Priority: P2)

Users need descriptive tooltips when hovering over callout icons to understand the exact meaning, especially for combined content/response scenarios.

**Why this priority**: Enhances learnability and reduces cognitive load. While the icon provides visual recognition, the tooltip ensures users understand the semantic meaning, particularly in edge cases.

**Independent Test**: Can be fully tested by hovering over various callout icons and verifying tooltip text matches the expected contextual description.

**Acceptance Scenarios**:

1. **Given** a callout icon, **When** user hovers over it, **Then** a tooltip displays contextual text (e.g., "Memo as content or response option")
2. **Given** different callout type combinations, **When** user hovers over their icons, **Then** each displays an appropriate tooltip describing its specific meaning

---

### User Story 4 - Consistent Visual Alignment (Priority: P2)

Users expect consistent visual presentation across all pages where callouts appear, ensuring a cohesive and professional interface experience.

**Why this priority**: Visual consistency is a fundamental UX principle that builds user trust and reduces cognitive friction when navigating different parts of the platform.

**Independent Test**: Can be fully tested by navigating through Preview page, Manage Flow page, and Template dialogs, comparing icon sizes, spacing, and alignment.

**Acceptance Scenarios**:

1. **Given** callouts displayed on the Preview page, **When** user views them, **Then** icons are 20px with reduced gap between icon and text
2. **Given** callouts displayed in Manage Flow, **When** user views them, **Then** icons match the same 20px size and spacing as Preview page
3. **Given** callouts in Template dialogs, **When** user views them, **Then** visual presentation matches other contexts (20px icons, consistent spacing)

---

### Edge Cases

- What happens when a callout has response options configured but hasn't received any responses yet? (Icon should show response option type, no "(n)" marker)
- How does the system handle callouts where the response type data is missing or undefined? (Fallback to framing type icon if available, otherwise Post icon)
- What happens if both framing type and response type are null/undefined? (Display Post icon as default)
- How are icons displayed during loading states before callout data is fully fetched? (Show skeleton/placeholder, then update to correct icon)
- What happens when transitioning between different callout types (e.g., user edits to add/remove framing)? (Icon updates in real-time to reflect new type)

## Requirements _(mandatory)_

This feature enhances the callout display system within the `src/domain/collaboration` context. The primary changes will update how callout icons are determined and rendered across multiple views (Preview, Manage Flow, Template dialogs).

**Domain Context**: The feature touches `src/domain/collaboration/callout` components that display callout cards/items in lists. The icon logic currently uses only framing type, which needs to be enhanced to consider both framing and response options.

**GraphQL Operations**:

- Review existing callout list queries to ensure they include necessary fields: `framing.profile.type`, and response option type data
- If response type isn't currently fetched in list views, add it to relevant fragments (with performance consideration noted in issue)
- Run `pnpm run codegen` after any GraphQL document updates
- Schema diff review to confirm no breaking changes

**UI Component Updates**:

- Callout icon determination logic must evaluate: (1) presence of framing, (2) presence of response options, (3) their respective types
- Icon size must change from 24px to 20px per design specification
- Spacing/gap between icon and text must be reduced per Figma design
- Tooltip component must display contextual text based on icon type
- All changes must preserve existing "(n)" response counter display

**React 19 Considerations**:

- Icon updates should not introduce unnecessary re-renders; memoize icon selection logic if needed
- Loading states should use Suspense boundaries where appropriate
- Transitions between icon types (e.g., after edits) should feel smooth

**State & Data**:

- Icon type derived from Apollo cache data (callout framing and response options)
- No new state management needed; icon calculation is pure function of existing data
- Ensure icon logic is deterministic and testable

**Accessibility**:

- Icons must have appropriate `aria-label` attributes describing their meaning
- Tooltips must be keyboard-accessible and screen-reader friendly
- Color contrast for icons must meet WCAG AA standards

**Performance**:

- Monitor GraphQL query performance if adding response type data to lists (concern noted in issue)
- Consider pagination or lazy loading if additional data significantly impacts load time
- Icon rendering should not block UI responsiveness

**Testing**:

- Unit tests for icon selection logic covering all four combinations in requirements table
- Visual regression tests for icon size and spacing changes
- Integration tests verifying correct icons appear in Preview, Manage Flow, and Template dialogs
- Accessibility tests for tooltips and aria-labels

**Observability**:

- Log any fallback scenarios where response type data is missing
- Track icon render performance to ensure no degradation
- Monitor for any GraphQL query timeout or performance issues

### Functional Requirements

- **FR-001**: System MUST display a "Post" icon when callout has no additional content (framing) and no response options
- **FR-002**: System MUST display an icon matching the response option type when callout has no additional content but has response options
- **FR-003**: System MUST display an icon matching the additional content type when callout has framing but no response options
- **FR-004**: System MUST display an icon matching the additional content type when callout has both framing and response options (content takes precedence)
- **FR-005**: All callout icons MUST be rendered at 20px size (reduced from current 24px)
- **FR-006**: System MUST display the "(n)" marker to indicate number of responses when applicable, regardless of icon type
- **FR-007**: System MUST reduce the gap between icon and text per Figma design specifications
- **FR-008**: System MUST display contextual tooltip text when user hovers over callout icon using existing i18n pattern `common.calloutType.{TYPE}`
- **FR-009**: Icon display behavior MUST be consistent across all pages: Preview, Manage Flow, and Template dialogs
- **FR-010**: System MUST fetch `settings.contribution.allowedTypes` field from GraphQL API to determine allowed contribution types for icon selection
- **FR-011**: System MUST handle missing or undefined response type data gracefully by falling back to framing type or Post icon
- **FR-012**: System MUST ensure icons meet WCAG AA contrast requirements and include appropriate aria-labels
- **FR-013**: System MUST update callout list GraphQL fragments to include `settings { contribution { allowedTypes } }` where icon determination is needed

### Key Entities

- **Callout**: Represents a discussion post or content item with optional framing (additional content type) and response options
  - `framing.profile.type`: `CalloutFramingType` enum (None, Memo, Whiteboard, Link) - Defines the additional content type
  - `settings.contribution.allowedTypes`: `[CalloutContributionType!]!` array (Post, Memo, Whiteboard, Link) - Defines allowed contribution/response types
  - `responsesCount`: Number of responses received (drives "(n)" marker display)
- **Icon Mapping**: Logic that determines which icon to display based on callout configuration
  - Input: `framingType: CalloutFramingType`, `allowedTypes: CalloutContributionType[]`
  - Output: specific icon component (MemoIcon, WhiteboardIcon, CtaIcon, LibraryBooksOutlined) and tooltip i18n key
  - Precedence: Framing Type (if not None) > First Allowed Contribution Type > Post (default)
  - Implementation: `src/domain/collaboration/callout/icons/calloutIcons.ts`

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can distinguish between post, response option, and additional content callouts by icon alone within 2 seconds of viewing
- **SC-002**: 100% of callouts across Preview, Manage Flow, and Template dialogs display icons that accurately match their content/response configuration
- **SC-003**: Icon sizes are consistently 20px and spacing matches Figma specifications across all callout views (verified via visual regression testing)
- **SC-004**: All callout icons include accessible tooltips that are keyboard-navigable and screen-reader compatible
- **SC-005**: Response count "(n)" marker displays correctly for all callouts with responses, maintaining 100% accuracy
- **SC-006**: Page load performance for callout lists remains within 5% of current baseline after adding response type data
- **SC-007**: Zero instances of missing or incorrect icons in production (fallback logic handles all edge cases)

## Assumptions

- **A-001**: The Figma design link provided (https://www.figma.com/design/CdBhOccimIYNIyAn2ijdZx/) contains the authoritative specifications for icon sizes, spacing, and visual alignment
- **A-002**: Response option type data is available via GraphQL API field `settings.contribution.allowedTypes` (requires query fragment updates)
- **A-003**: Current icon components exist in the codebase (`calloutIcons.ts`) and can be resized via props or styling
- **A-004**: The tooltip component system exists (MUI Tooltip) and can be integrated with callout icons
- **A-005**: Performance impact of fetching additional response type data is acceptable (or can be optimized)
- **A-006**: The icon precedence rule (Additional Content > Response Option > Post) aligns with existing implementation in `calloutIcons.ts` and user expectations
- **A-007**: All supported callout types have corresponding icon assets available (Memo, Whiteboard, Link, Post icons confirmed in codebase)
- **A-008**: Tooltip text follows existing i18n pattern `common.calloutType.{TYPE}` where TYPE is the CalloutFramingType or CalloutContributionType value
- **A-009**: Exact spacing pixel values will be confirmed from Figma design during implementation (design requires authentication to access)
- **A-010**: Callout types are defined by GraphQL enums: `CalloutFramingType` (None, Memo, Whiteboard, Link) and `CalloutContributionType` (Post, Memo, Whiteboard, Link)

## Out of Scope

- **OOS-001**: Redesigning or adding new icon types not specified in the Figma design
- **OOS-002**: Changing the "(n)" response counter format or behavior beyond maintaining its current display
- **OOS-003**: Modifying callout functionality beyond icon display (e.g., editing, creating, deleting callouts)
- **OOS-004**: Backend changes to GraphQL schema beyond ensuring required data fields are available
- **OOS-005**: Performance optimizations unrelated to the icon display feature (e.g., general query optimization)
- **OOS-006**: Mobile-specific icon sizing or responsive design changes (unless explicitly required by Figma design)
