/** Shared chat avatar size scale (outer circle) — single source for every chat avatar surface. */
export const AVATAR_SIZE_CLASS = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
} as const;

export type AvatarSize = keyof typeof AVATAR_SIZE_CLASS;
