import { expect, request, test } from '@playwright/test';

/**
 * View a Tasks board
 * @forge-acceptance
 *
 * Durable regression of the acceptance walk. Mirrors the manual verifier
 * scenario-for-scenario. The load-bearing guarantees are:
 * - a POSTS callout carrying the reserved `task` classification tagset renders
 * as a horizontal board with the columns in their authored order;
 * - the per-column counters come from the SERVER (`Callout.taskColumnCounts`,
 * one GROUP BY, zero-filled, in column order) — never client-derived;
 * - a callout WITHOUT the marker renders exactly as an ordinary posts callout
 * (`taskColumnCounts` is null, no board UI);
 * - a NON-MEMBER of a public space sees the board read-only: the board content
 * (columns, counters, cards) is visible, but there is no Add task / Manage
 * columns / drag affordance, because those are gated on CONTRIBUTE / UPDATE /
 * MOVE_TASK which a READ-only viewer does not hold.
 *
 * Auth model (identical to task-board-move.spec.ts): the private GraphQL
 * endpoint validates a Hydra-issued JWT. Tokens are obtained out-of-band
 * (OIDC Authorization Code + PKCE — see server/.scripts/lib/kratos.sh
 * `oidc_login_jwt`) and injected via env so this spec has no dependency on
 * browser SSO. Seed actors / inputs:
 * TB_TOKEN_ADMIN — platform admin (creates the boards + a plain callout)
 * TB_CALLOUTS_SET — the (private) space collaboration calloutsSet id used
 * for the API-level assertions
 * TB_WEB_ORIGIN — gateway origin (default http://localhost:3000); NEVER :3001
 * TB_SPACE_URL — private space page URL for the board-render UI walk
 * TB_PUBLIC_CALLOUT_ID — id of a PUBLISHED task board on a PUBLIC space, used to
 * assert the anonymous (non-member) READ-only view
 * TB_PUBLIC_SPACE_URL — public space page URL for the UI walk (optional; the
 * API-level assertion runs without it)
 *
 * Deterministic, no sleeps: all waits are Playwright auto-waits / expect polling.
 */

const ORIGIN = process.env.TB_WEB_ORIGIN ?? 'http://localhost:3000';
const GQL_PRIVATE = `${ORIGIN}/api/private/non-interactive/graphql`;
const GQL_PUBLIC = `${ORIGIN}/api/public/graphql`;
const CALLOUTS_SET = process.env.TB_CALLOUTS_SET ?? '';
const SPACE_URL = process.env.TB_SPACE_URL ?? '';
const PUBLIC_CALLOUT_ID = process.env.TB_PUBLIC_CALLOUT_ID ?? '';
const PUBLIC_SPACE_URL = process.env.TB_PUBLIC_SPACE_URL ?? '';
const ADMIN = process.env.TB_TOKEN_ADMIN ?? '';

const DEFAULT_COLUMNS = ['Backlog', 'To do', 'In progress', 'Done'];
const WIDE_COLUMNS = ['Backlog', 'To do', 'In progress', 'Review', 'QA', 'Staging', 'Blocked', 'Done'];

type GqlResult<T> = { data?: T; errors?: Array<{ message: string; extensions?: { code?: string } }> };

async function gql<T>(
  endpoint: string,
  token: string | null,
  query: string,
  variables?: Record<string, unknown>
): Promise<GqlResult<T>> {
  const ctx = await request.newContext();
  const res = await ctx.post(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    data: { query, variables },
  });
  const body = (await res.json()) as GqlResult<T>;
  await ctx.dispose();
  return body;
}

const CREATE_CALLOUT = /* GraphQL */ `
  mutation ($d: CreateCalloutOnCalloutsSetInput!) {
    createCalloutOnCalloutsSet(calloutData: $d) {
      id
      nameID
      classification { tagsets { name allowedValues } }
      taskColumnCounts { column count }
    }
  }`;

const CREATE_CONTRIB = /* GraphQL */ `
  mutation ($d: CreateContributionOnCalloutInput!) {
    createContributionOnCallout(contributionData: $d) {
      id
      post { id profile { displayName } }
      classification { tagsets { name tags } }
    }
  }`;

const CALLOUT_VIEW = /* GraphQL */ `
  query ($id: UUID!) {
    lookup {
      callout(ID: $id) {
        id
        authorization { myPrivileges }
        taskColumnCounts { column count }
        classification { tagsets { name allowedValues tags } }
        contributions { id post { profile { displayName } } }
      }
    }
  }`;

type Counts = Array<{ column: string; count: number }>;

function countMap(counts: Counts): Record<string, number> {
  return Object.fromEntries(counts.map(c => [c.column, c.count]));
}

async function seedBoard(displayName: string, columns?: string[]) {
  const board = await gql<{
    createCalloutOnCalloutsSet: {
      id: string;
      nameID: string;
      classification: { tagsets: Array<{ name: string; allowedValues: string[] }> };
      taskColumnCounts: Counts;
    };
  }>(GQL_PRIVATE, ADMIN, CREATE_CALLOUT, {
    d: {
      calloutsSetID: CALLOUTS_SET,
      framing: { profile: { displayName } },
      settings: { visibility: 'PUBLISHED', contribution: { enabled: true, allowedTypes: ['POST'] } },
      taskBoard: columns ? { columns } : {},
    },
  });
  expect(board.errors, `seed ${displayName}`).toBeUndefined();
  return board.data!.createCalloutOnCalloutsSet;
}

async function addTask(calloutID: string, column: string, displayName: string) {
  const res = await gql<{ createContributionOnCallout: { id: string } }>(GQL_PRIVATE, ADMIN, CREATE_CONTRIB, {
    d: { calloutID, type: 'POST', taskColumn: column, post: { profileData: { displayName } } },
  });
  expect(res.errors, `add task ${displayName}`).toBeUndefined();
  return res.data!.createContributionOnCallout.id;
}

test.describe('@forge-acceptance view a Tasks board', () => {
  test.skip(
    !ADMIN || !CALLOUTS_SET,
    'Requires TB_TOKEN_ADMIN + TB_CALLOUTS_SET (see header). Obtain the JWT via oidc_login_jwt.'
  );

  let viewBoardId: string;

  test('default board: horizontal columns in order, counters 2/0/0/1, cards under their columns', async ({ page }) => {
    const board = await seedBoard(`TaskBoard View Board ${Date.now()}`);
    viewBoardId = board.id;

    // Marker present, default columns in authored order.
    const taskTagset = board.classification.tagsets.find(t => t.name === 'task');
    expect(taskTagset, 'reserved `task` marker tagset present').toBeTruthy();
    expect(taskTagset!.allowedValues).toEqual(DEFAULT_COLUMNS);

    // Seed 2 tasks in Backlog + 1 in Done.
    await addTask(viewBoardId, 'Backlog', 'Task one');
    await addTask(viewBoardId, 'Backlog', 'Task two');
    await addTask(viewBoardId, 'Done', 'Task three');

    // Server-computed counters, zero-filled, in column order.
    const view = await gql<{
      lookup: {
        callout: {
          taskColumnCounts: Counts;
          classification: { tagsets: Array<{ name: string; allowedValues: string[] }> };
        };
      };
    }>(GQL_PRIVATE, ADMIN, CALLOUT_VIEW, { id: viewBoardId });
    const counts = view.data!.lookup.callout.taskColumnCounts;
    expect(counts.map(c => c.column)).toEqual(DEFAULT_COLUMNS);
    expect(counts.map(c => c.count)).toEqual([2, 0, 0, 1]);

    if (SPACE_URL) {
      await page.goto(SPACE_URL);
      // Columns render in order and cards sit under their column.
      for (const col of DEFAULT_COLUMNS) {
        await expect(page.getByText(col, { exact: true }).first()).toBeVisible();
      }
      const backlog = page.getByText('Backlog', { exact: true }).first().locator('..');
      await expect(backlog).toContainText('Task one');
      await expect(backlog).toContainText('Task two');
      const done = page.getByText('Done', { exact: true }).first().locator('..');
      await expect(done).toContainText('Task three');
    }
  });

  test('an ordinary posts callout in the same space renders with NO board UI', async () => {
    const plain = await gql<{
      createCalloutOnCalloutsSet: {
        id: string;
        taskColumnCounts: Counts | null;
        classification: { tagsets: Array<{ name: string }> };
      };
    }>(GQL_PRIVATE, ADMIN, CREATE_CALLOUT, {
      d: {
        calloutsSetID: CALLOUTS_SET,
        framing: { profile: { displayName: `TaskBoard Plain Posts ${Date.now()}` } },
        settings: { visibility: 'PUBLISHED', contribution: { enabled: true, allowedTypes: ['POST'] } },
        // no taskBoard input → ordinary posts callout
      },
    });
    expect(plain.errors).toBeUndefined();
    // No marker, and taskColumnCounts is null → the client never mounts the board.
    expect(plain.data!.createCalloutOnCalloutsSet.classification.tagsets.some(t => t.name === 'task')).toBe(false);
    expect(plain.data!.createCalloutOnCalloutsSet.taskColumnCounts).toBeNull();
  });

  test('a board with 8 columns keeps them in order and does not wrap', async ({ page }) => {
    const wide = await seedBoard(`TaskBoard Wide Board ${Date.now()}`, WIDE_COLUMNS);
    const tagset = wide.classification.tagsets.find(t => t.name === 'task');
    expect(tagset!.allowedValues).toEqual(WIDE_COLUMNS);
    expect(wide.taskColumnCounts.map(c => c.column)).toEqual(WIDE_COLUMNS);

    if (SPACE_URL) {
      await page.goto(SPACE_URL);
      // All 8 columns are present; the strip is a single non-wrapping horizontally
      // scrollable row (flex-nowrap + overflow-x-auto in TaskBoardView).
      for (const col of WIDE_COLUMNS) {
        await expect(page.getByText(col, { exact: true }).first()).toBeVisible();
      }
      const strip = page.locator('[class*="overflow-x-auto"][class*="flex-nowrap"]').first();
      await expect(strip).toBeVisible();
    }
  });

  test('a column with zero tasks is present, in order, with count 0', async () => {
    const board = await seedBoard(`TaskBoard Empty Cols Board ${Date.now()}`);
    const view = await gql<{ lookup: { callout: { taskColumnCounts: Counts } } }>(GQL_PRIVATE, ADMIN, CALLOUT_VIEW, {
      id: board.id,
    });
    const counts = view.data!.lookup.callout.taskColumnCounts;
    // All four default columns are present, in order, each zero-filled.
    expect(counts.map(c => c.column)).toEqual(DEFAULT_COLUMNS);
    expect(counts.map(c => c.count)).toEqual([0, 0, 0, 0]);
  });

  test('a board with 200 tasks in one column reads 200 (server value) and stays usable', async () => {
    const big = await seedBoard(`TaskBoard Big Board ${Date.now()}`);
    // Seed 200 tasks into Backlog in bounded-parallel batches (no sleeps).
    const N = 200;
    const BATCH = 20;
    for (let start = 0; start < N; start += BATCH) {
      await Promise.all(
        Array.from({ length: Math.min(BATCH, N - start) }, (_, k) =>
          addTask(big.id, 'Backlog', `Bulk task ${start + k + 1}`)
        )
      );
    }
    const view = await gql<{ lookup: { callout: { taskColumnCounts: Counts } } }>(GQL_PRIVATE, ADMIN, CALLOUT_VIEW, {
      id: big.id,
    });
    const m = countMap(view.data!.lookup.callout.taskColumnCounts);
    // The counter is the authoritative server GROUP BY, not a client card count.
    expect(m.Backlog).toBe(200);
    expect(m['To do']).toBe(0);
  });

  test('a non-member of a PUBLIC space sees the board read-only (no add/manage/drag)', async ({ page }) => {
    test.skip(!PUBLIC_CALLOUT_ID, 'Requires TB_PUBLIC_CALLOUT_ID — a PUBLISHED task board on a PUBLIC space.');

    // Anonymous (no token) read via the PUBLIC endpoint: board content is visible,
    // but the only privilege granted is READ.
    const anon = await gql<{
      lookup: {
        callout: {
          authorization: { myPrivileges: string[] };
          taskColumnCounts: Counts;
          classification: { tagsets: Array<{ name: string; allowedValues: string[]; tags: string[] }> };
        };
      };
    }>(GQL_PUBLIC, null, CALLOUT_VIEW, { id: PUBLIC_CALLOUT_ID });
    const callout = anon.data!.lookup.callout;

    // Board content is visible to the non-member.
    const marker = callout.classification.tagsets.find(t => t.name === 'task');
    expect(marker, 'non-member can see the board marker + columns').toBeTruthy();
    expect(callout.taskColumnCounts.length).toBeGreaterThan(0);

    // The mutating privileges the affordances are gated on are ALL absent.
    const privs = callout.authorization.myPrivileges;
    expect(privs).toContain('READ');
    expect(privs).not.toContain('CONTRIBUTE'); // gates "Add task"
    expect(privs).not.toContain('MOVE_TASK'); //  gates drag
    expect(privs).not.toContain('UPDATE'); //     gates "Manage columns"

    if (PUBLIC_SPACE_URL) {
      await page.goto(PUBLIC_SPACE_URL);
      // The board renders (a known column is visible) but read-only: no affordances.
      await expect(page.getByText(marker!.allowedValues[0], { exact: true }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /add task/i })).toHaveCount(0);
      await expect(page.getByRole('button', { name: /manage columns/i })).toHaveCount(0);
    }
  });
});
