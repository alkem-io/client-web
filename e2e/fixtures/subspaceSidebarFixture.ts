import { type APIRequestContext, expect, type Page } from '@playwright/test';
import { LoginPage } from './loginPage';

/**
 * Shared access to the subspace sidebar fixture for the three subspace sidebar walks
 * (defaults, Customize Sidebar, configured widgets). Live-stack only, never part of
 * `pnpm test`.
 *
 * The fixture is the one the feature quickstart in the agents-hq workspace seeds: a PUBLIC
 * top-level Space, an L1 "Alpha" created from the platform subspace template (five phases,
 * positional lists), an L2 "Alpha-2" under it and, optionally, an L1 "Beta" whose phase-2 list
 * was customized. The walks mutate and restore Alpha's lists, so run them with `--workers=1`.
 *
 * Environment — one scheme for all three walks, and the only source of credentials:
 *   ALKEMIO_BASE_URL            the stack (default http://localhost:3000); the login and the
 *                               GraphQL probes go through its `/api` routes, so the stack needs
 *                               ENABLE_NON_INTERACTIVE_LOGIN=true
 *   AUTH_TEST_HARNESS_EMAIL     an admin of the Space, Alpha and Alpha-2 (default admin@alkem.io)
 *   AUTH_TEST_HARNESS_PASSWORD  the password of every account below; there is no default — the
 *                               walks skip without it
 *   E2E_READONLY_USER_EMAIL     a member of the Space, Alpha and Alpha-2 without update rights
 *   E2E_SIDEBAR_L0_NAMEID       the top-level Space
 *   E2E_SIDEBAR_ALPHA_NAMEID    the L1 Alpha
 *   E2E_SIDEBAR_ALPHA2_NAMEID   the L2 Alpha-2
 *   E2E_SIDEBAR_BETA_NAMEID     (optional) the L1 Beta
 *
 * One failure behaviour: a login that does not succeed, or a probe that answers with an error,
 * is an assertion failure — never a skip and never a silent fallback.
 */

export const BASE_URL = process.env.ALKEMIO_BASE_URL || 'http://localhost:3000';
export const ADMIN_EMAIL = process.env.AUTH_TEST_HARNESS_EMAIL || 'admin@alkem.io';
export const READONLY_EMAIL = process.env.E2E_READONLY_USER_EMAIL;
const PASSWORD = process.env.AUTH_TEST_HARNESS_PASSWORD;

const NAMEIDS = {
  E2E_SIDEBAR_L0_NAMEID: process.env.E2E_SIDEBAR_L0_NAMEID,
  E2E_SIDEBAR_ALPHA_NAMEID: process.env.E2E_SIDEBAR_ALPHA_NAMEID,
  E2E_SIDEBAR_ALPHA2_NAMEID: process.env.E2E_SIDEBAR_ALPHA2_NAMEID,
};
const BETA_NAMEID = process.env.E2E_SIDEBAR_BETA_NAMEID;

const L0_URL = `${BASE_URL}/${NAMEIDS.E2E_SIDEBAR_L0_NAMEID}`;
const ALPHA_URL = `${L0_URL}/challenges/${NAMEIDS.E2E_SIDEBAR_ALPHA_NAMEID}`;

/** The fixture's page URLs. `beta` is undefined when E2E_SIDEBAR_BETA_NAMEID is not set. */
export const FIXTURE_URLS = {
  l0: L0_URL,
  alpha: ALPHA_URL,
  alpha2: `${ALPHA_URL}/opportunities/${NAMEIDS.E2E_SIDEBAR_ALPHA2_NAMEID}`,
  beta: BETA_NAMEID ? `${L0_URL}/challenges/${BETA_NAMEID}` : undefined,
};

/** Why the walks cannot run without credentials, or undefined when they can. */
export const missingCredentials: string | undefined = PASSWORD
  ? undefined
  : 'AUTH_TEST_HARNESS_PASSWORD not set — the subspace sidebar walks have no credentials';

/** Why the fixture walks cannot run, or undefined when they can. */
export const missingFixture: string | undefined =
  missingCredentials ??
  (() => {
    const unset = Object.entries(NAMEIDS)
      .filter(([, value]) => !value)
      .map(([name]) => name);
    return unset.length > 0 ? `${unset.join(', ')} not set — no subspace sidebar fixture to walk` : undefined;
  })();

/** Why the walks that need the member persona cannot run, or undefined when they can. */
export const missingReadonlyUser: string | undefined = READONLY_EMAIL
  ? undefined
  : 'E2E_READONLY_USER_EMAIL not set — the member without update rights is required';

/** Why the walks that need Beta cannot run, or undefined when they can. */
export const missingBeta: string | undefined = BETA_NAMEID
  ? undefined
  : 'E2E_SIDEBAR_BETA_NAMEID not set — no customized L1 to read';

function password(): string {
  // The specs skip before reaching here; this guards a missing skip, it is not a fallback.
  if (!PASSWORD) throw new Error(missingCredentials);
  return PASSWORD;
}

/** Signs `page` in through the real login UI. */
export async function signIn(page: Page, email: string = ADMIN_EMAIL): Promise<void> {
  await new LoginPage(page, BASE_URL).login(email, password());
}

/**
 * Runs a GraphQL operation through the private non-interactive endpoint — as the admin unless
 * `email` names another fixture account (every account shares the harness password).
 */
export async function gql<T>(
  request: APIRequestContext,
  query: string,
  variables: Record<string, unknown> = {},
  email: string = ADMIN_EMAIL
): Promise<T> {
  const login = await request.post(`${BASE_URL}/api/auth/non-interactive-login`, {
    data: { email, password: password() },
  });
  expect(login.ok(), `non-interactive login as ${email} (needs ENABLE_NON_INTERACTIVE_LOGIN=true)`).toBe(true);
  const { api_token: token } = (await login.json()) as { api_token: string };
  const response = await request.post(`${BASE_URL}/api/private/non-interactive/graphql`, {
    headers: { authorization: `Bearer ${token}` },
    data: { query, variables },
  });
  expect(response.ok(), `GraphQL request answered HTTP ${response.status()}`).toBe(true);
  const body = (await response.json()) as { data?: T; errors?: unknown };
  expect(body.errors, JSON.stringify(body.errors)).toBeUndefined();
  return body.data as T;
}

/** Lowest sortOrder first, ties broken by id (plain code-unit compare) — the first-state rule. */
export function rankStates<T extends { sortOrder: number; id?: string }>(states: readonly T[]): T[] {
  return [...states].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    const [x, y] = [(a.id ?? '').toLowerCase(), (b.id ?? '').toLowerCase()];
    return x < y ? -1 : x > y ? 1 : 0;
  });
}

export type FixtureIds = { l0: string; alpha: string; alpha2: string; beta?: string };

/** Resolves the fixture's space ids from its nameIDs. */
export async function resolveFixtureIds(request: APIRequestContext): Promise<FixtureIds> {
  const { E2E_SIDEBAR_L0_NAMEID: l0NameId, E2E_SIDEBAR_ALPHA_NAMEID: alphaNameId } = NAMEIDS;
  type Subspace = { id: string; nameID: string };
  const data = await gql<{
    lookupByName: { space?: { id: string; subspaces: (Subspace & { subspaces: Subspace[] })[] } };
  }>(
    request,
    `query($l0: NameID!) { lookupByName { space(NAMEID: $l0) { id subspaces { id nameID subspaces { id nameID } } } } }`,
    { l0: l0NameId }
  );
  const l0 = data.lookupByName.space;
  const alpha = l0?.subspaces.find(s => s.nameID === alphaNameId);
  const alpha2 = alpha?.subspaces.find(s => s.nameID === NAMEIDS.E2E_SIDEBAR_ALPHA2_NAMEID);
  const beta = BETA_NAMEID ? l0?.subspaces.find(s => s.nameID === BETA_NAMEID) : undefined;
  expect(l0, `Space ${l0NameId}`).toBeTruthy();
  expect(alpha, `L1 ${alphaNameId} under ${l0NameId}`).toBeTruthy();
  expect(alpha2, `L2 ${NAMEIDS.E2E_SIDEBAR_ALPHA2_NAMEID} under ${alphaNameId}`).toBeTruthy();
  if (BETA_NAMEID) expect(beta, `L1 ${BETA_NAMEID} under ${l0NameId}`).toBeTruthy();
  return { l0: l0?.id as string, alpha: alpha?.id as string, alpha2: alpha2?.id as string, beta: beta?.id };
}

/** The privileges `email` holds on a space — what gates the sidebar's Create Subspace / Invite. */
export async function readMyPrivileges(request: APIRequestContext, spaceId: string, email: string): Promise<string[]> {
  const data = await gql<{ lookup: { space: { authorization: { myPrivileges: string[] } } } }>(
    request,
    `query($id: UUID!) { lookup { space(ID: $id) { authorization { myPrivileges } } } }`,
    { id: spaceId },
    email
  );
  return data.lookup.space.authorization.myPrivileges;
}

/** Whether members of `spaceId` may create subspaces — the setting that grants CREATE_SUBSPACE to them. */
export async function readAllowMembersToCreateSubspaces(request: APIRequestContext, spaceId: string): Promise<boolean> {
  const data = await gql<{ lookup: { space: { settings: { collaboration: { allowMembersToCreateSubspaces: boolean } } } } }>(
    request,
    `query($id: UUID!) { lookup { space(ID: $id) { settings { collaboration { allowMembersToCreateSubspaces } } } } }`,
    { id: spaceId }
  );
  return data.lookup.space.settings.collaboration.allowMembersToCreateSubspaces;
}

/** Sets that setting; the server re-applies the space's authorization policy in the same request. */
export async function setAllowMembersToCreateSubspaces(
  request: APIRequestContext,
  spaceId: string,
  value: boolean
): Promise<void> {
  await gql(
    request,
    `mutation($d: UpdateSpaceSettingsInput!) { updateSpaceSettings(settingsData: $d) { id } }`,
    { d: { spaceID: spaceId, settings: { collaboration: { allowMembersToCreateSubspaces: value } } } }
  );
}

export type Phase = {
  id: string;
  displayName: string;
  sortOrder: number;
  settings: { visible: boolean; sidebar: string[]; descriptionDisplayMode: string };
};

/** A space's innovation flow, with its phases ranked by the first-state rule. */
export async function readPhases(request: APIRequestContext, spaceId: string) {
  const data = await gql<{
    lookup: { space: { collaboration: { innovationFlow: { id: string; states: Phase[] } } } };
  }>(
    request,
    `query($id: UUID!) { lookup { space(ID: $id) { collaboration { innovationFlow { id states {
      id displayName sortOrder settings { visible sidebar descriptionDisplayMode } } } } } } }`,
    { id: spaceId }
  );
  const flow = data.lookup.space.collaboration.innovationFlow;
  return { flowId: flow.id, phases: rankStates(flow.states) };
}

/** Settings-only phase update: the keys left out keep their stored values. */
export async function updatePhaseSettings(
  request: APIRequestContext,
  stateId: string,
  settings: Record<string, unknown>
): Promise<void> {
  await gql(
    request,
    `mutation($id: UUID!, $s: UpdateInnovationFlowStateSettingsInput) {
      updateInnovationFlowState(stateData: { innovationFlowStateID: $id, settings: $s }) { id } }`,
    { id: stateId, s: settings }
  );
}

export async function setPhaseOrder(request: APIRequestContext, flowId: string, stateIds: string[]): Promise<void> {
  await gql(
    request,
    `mutation($d: UpdateInnovationFlowStatesSortOrderInput!) { updateInnovationFlowStatesSortOrder(sortOrderData: $d) { id } }`,
    { d: { innovationFlowID: flowId, stateIDs: stateIds } }
  );
}

/**
 * How many callouts the sidebar search finds for `term` in `spaceId`, phase `flowStateId` — the
 * exact search the sidebar issues (same filter, same folding). A stack without Elasticsearch
 * answers an empty list, not an error, so an availability probe must ask for a known term.
 */
export async function searchHits(
  request: APIRequestContext,
  spaceId: string,
  flowStateId: string,
  term: string
): Promise<number> {
  const data = await gql<{ search: { calloutResults: { results: { id: string }[] } } }>(
    request,
    `query($d: SearchInput!) { search(searchData: $d) { calloutResults { results { id } } } }`,
    {
      d: {
        terms: [term],
        searchInFlowStateFilter: flowStateId,
        searchInSpaceFilter: spaceId,
        foldCalloutResources: true,
        filters: [{ category: 'COLLABORATION_TOOLS', size: 20, types: ['CALLOUT'] }],
      },
    }
  );
  return data.search.calloutResults.results.length;
}

/** The platform subspace template's first-phase list after the positional migration. */
export const SUBSPACE_DEFAULT = [
  'INTENT',
  'ABOUT',
  'CREATE_POST',
  'COMMUNITY',
  'EVENTS',
  'ACTIVITY',
  'INDEX',
  'SUBSPACE_LINKS',
  'VIRTUAL_CONTRIBUTORS',
  'UPDATES',
];
