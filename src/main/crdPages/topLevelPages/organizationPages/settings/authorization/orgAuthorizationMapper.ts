import {
  type AvailableUserLike,
  mapAvailableUserToPerson,
  mapCurrentMemberToPerson,
  type RoleSetMemberLike,
} from '../community/orgCommunityMapper';

/**
 * The Authorization tab reuses the exact same row-shape mapping as the
 * Community tab — `RoleAssignmentPerson` — for both the Admin and Owner
 * sub-tabs (US11 / data-model.md "User Story 11"). The mappers themselves
 * live in `community/orgCommunityMapper.ts`; this re-export keeps the
 * Authorization integration page's imports local to its own folder while
 * avoiding duplication of the row-mapping logic.
 */
export { type AvailableUserLike, mapAvailableUserToPerson, mapCurrentMemberToPerson, type RoleSetMemberLike };
