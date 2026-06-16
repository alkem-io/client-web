export type InnovationFlowStateModel = {
  id: string;
  displayName: string;
  description?: string;
  settings: {
    allowNewCallouts: boolean;
    /**
     * Whether this phase/tab is shown in the member-facing navigation. Optional on the client:
     * `undefined` when the platform does not yet expose the server-side `visible` flag, in which
     * case the Hide/Show affordance is suppressed and members see all phases (graceful degradation).
     * `false` = hidden from members; `true`/absent = shown. Hiding is UI-only and never affects
     * authorization or content access.
     */
    visible?: boolean;
  };
  sortOrder: number;
  defaultCalloutTemplate?: {
    id: string;
    profile: {
      displayName: string;
    };
  } | null;
};
