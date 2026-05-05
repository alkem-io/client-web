/**
 * Backwards-compatible re-export shim. The implementation moved to the shared
 * `@/crd/components/common/ProfileResourceTabStrip` (Phase 10 — the strip is
 * now used by the User profile AND the Organization profile right column).
 *
 * Prefer importing from `@/crd/components/common/ProfileResourceTabStrip` in
 * any new code. This shim keeps existing User-side imports working until the
 * call sites migrate.
 */
export {
  type ProfileResourceTab as UserResourceTab,
  ProfileResourceTabStrip as UserResourceTabStrip,
  type ProfileResourceTabStripProps as UserResourceTabStripProps,
  type ResourceTabKey,
} from '@/crd/components/common/ProfileResourceTabStrip';
