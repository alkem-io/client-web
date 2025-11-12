# Fix Callout Icon Display

**Issue**: [#8655](https://github.com/alkem-io/client-web/issues/8655)
**Branch**: `001-fix-callout-icons`
**Status**: Specification Complete
**Created**: November 12, 2025

## Overview

Fix callout icons to dynamically reflect content type and response options based on Figma design specifications. Currently, all callouts display the same icon regardless of their framing or response type, making it difficult for users to distinguish between different callout types.

## Problem Statement

Users cannot visually distinguish between:

- Posts (no framing, no response options)
- Response-enabled callouts (with response options)
- Framed content (with additional content types like Memo, Whiteboard, etc.)

## Solution

Implement dynamic icon selection based on this logic:

| Additional Content | Response Options | Expected Icon               |
| ------------------ | ---------------- | --------------------------- |
| ✗                  | ✗                | **Post**                    |
| ✗                  | ✓                | **Response Option Type**    |
| ✓                  | ✗                | **Additional Content Type** |
| ✓                  | ✓                | **Additional Content Type** |

## Key Changes

1. **Icon Logic**: Evaluate both framing and response options to determine icon
2. **Icon Size**: Reduce from 24px to 20px
3. **Spacing**: Reduce gap between icon and text
4. **Tooltips**: Add contextual tooltips (e.g., "Memo as content or response option")
5. **Consistency**: Apply across Preview, Manage Flow, and Template dialogs

## Files

- `spec.md` - Complete feature specification with user stories, requirements, and success criteria

## Next Steps

1. Review specification for completeness and accuracy
2. Validate Figma design specifications
3. Confirm GraphQL schema includes necessary response option data
4. Begin implementation following the spec's acceptance scenarios
5. Create unit tests for icon selection logic
6. Add visual regression tests for sizing and spacing

## Performance Considerations

The issue notes potential performance concerns with fetching additional response option data in list views. The implementation should:

- Monitor query performance
- Consider pagination or lazy loading if needed
- Ensure icon rendering doesn't block UI responsiveness

## References

- [Figma Design](https://www.figma.com/design/CdBhOccimIYNIyAn2ijdZx/Post-Icons---Resposne-Display-Innovation-Flow?node-id=109-78&t=lDTXTzYnvYq34Q3w-1)
- [GitHub Issue #8655](https://github.com/alkem-io/client-web/issues/8655)
