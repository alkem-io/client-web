// Deterministic id-to-color hash used as a visual fallback when a space (or any
// resource) has no avatar / banner image. The same id always maps to the same
// color across the app, so users can recognise an entity by its accent colour.
//
// Used by:
// - `src/main/crdPages/dashboard/dashboardDataMappers.ts`
// - `src/main/crdPages/dashboard/pendingMembershipsDataMappers.ts`
// - `src/crd/app/data/dashboard.ts` (preview app mock data)
const SPACE_COLOR_PALETTE = ['#4caf50', '#42a5f5', '#ab47bc', '#ec407a', '#ffa726', '#8bc34a'];

export const pickColorFromId = (id: string): string => {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return SPACE_COLOR_PALETTE[sum % SPACE_COLOR_PALETTE.length];
};
