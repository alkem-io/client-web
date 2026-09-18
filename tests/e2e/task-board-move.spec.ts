import { expect, request, test } from '@playwright/test';

/**
 * Move a task between columns
 * @forge-acceptance
 *
 * Durable regression of the acceptance walk. Mirrors the manual verifier
 * scenario-for-scenario. The load-bearing guarantee is the NEW
 * member-executable MOVE_TASK privilege: a plain member (non-admin, non-creator)
 * can move ANOTHER member's task, while non-members and content edits stay
 * denied, and concurrent moves converge to exactly one column.
 *
 * Auth model: the private GraphQL endpoint validates a Hydra-issued JWT (JWS).
 * Tokens are obtained out-of-band (OIDC Authorization Code + PKCE — see
 * server/.scripts/lib/kratos.sh `oidc_login_jwt`) and injected via env so this
 * spec has no dependency on browser SSO (which short-circuits to the first
 * active Hydra session in a shared dev stack). Seed actors:
 * TB_TOKEN_ADMIN — platform admin (creates the board + a plain posts callout)
 * TB_TOKEN_A — space member, creator of the task
 * TB_TOKEN_B — space member, NON-admin NON-creator (the mover)
 * TB_TOKEN_C — a verified user who is NOT a member of the space
 * TB_CALLOUTS_SET — the space collaboration calloutsSet id
 * TB_WEB_ORIGIN — gateway origin (default http://localhost:3000); NEVER :3001
 * TB_SPACE_URL — space page URL used for the UI persistence assertion
 *
 * Deterministic, no sleeps: all waits are Playwright auto-waits / expect polling.
 */

const GQL = `${process.env.TB_WEB_ORIGIN ?? 'http://localhost:3000'}/api/private/non-interactive/graphql`;
const CALLOUTS_SET = process.env.TB_CALLOUTS_SET ?? '';
const SPACE_URL = process.env.TB_SPACE_URL ?? '';

const TOKENS = {
  admin: process.env.TB_TOKEN_ADMIN ?? '',
  a: process.env.TB_TOKEN_A ?? '',
  b: process.env.TB_TOKEN_B ?? '',
  c: process.env.TB_TOKEN_C ?? '',
};

type GqlResult<T> = { data?: T; errors?: Array<{ message: string; extensions?: { code?: string } }> };

async function gql<T>(token: string, query: string, variables?: Record<string, unknown>): Promise<GqlResult<T>> {
  const ctx = await request.newContext();
  const res = await ctx.post(GQL, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
      classification { tagsets { name allowedValues } }
      taskColumnCounts { column count }
    }
  }`;

const CREATE_CONTRIB = /* GraphQL */ `
  mutation ($d: CreateContributionOnCalloutInput!) {
    createContributionOnCallout(contributionData: $d) {
      id
      post { id }
      classification { tagsets { name tags } }
    }
  }`;

const MOVE = /* GraphQL */ `
  mutation ($d: MoveTaskToColumnInput!) {
    moveTaskToColumn(moveData: $d) { id classification { tagsets { tags } } }
  }`;

const COUNTS = /* GraphQL */ `
  query ($id: UUID!) { lookup { callout(ID: $id) { taskColumnCounts { column count } } } }`;

const CONTRIB_COLUMN = /* GraphQL */ `
  query ($id: UUID!) { lookup { contribution(ID: $id) { classification { tagsets { tags } } } } }`;

const UPDATE_POST = /* GraphQL */ `
  mutation ($d: UpdatePostInput!) { updatePost(postData: $d) { id profile { displayName } } }`;

function countMap(counts: Array<{ column: string; count: number }>): Record<string, number> {
  return Object.fromEntries(counts.map(c => [c.column, c.count]));
}

test.describe('@forge-acceptance move a task between columns', () => {
  test.skip(
    !TOKENS.admin || !TOKENS.a || !TOKENS.b || !TOKENS.c || !CALLOUTS_SET,
    'Requires TB_TOKEN_ADMIN/A/B/C + TB_CALLOUTS_SET (see header). Obtain JWTs via oidc_login_jwt.'
  );

  let boardId: string;
  let taskId: string;
  let taskPostId: string;
  let plainContribId: string;

  test.beforeAll(async () => {
    // Seed: a Tasks board with the 4 default columns.
    const board = await gql<{
      createCalloutOnCalloutsSet: { id: string; taskColumnCounts: Array<{ column: string; count: number }> };
    }>(TOKENS.admin, CREATE_CALLOUT, {
      d: {
        calloutsSetID: CALLOUTS_SET,
        framing: { profile: { displayName: `TaskBoard Board ${Date.now()}` } },
        settings: { visibility: 'PUBLISHED', contribution: { enabled: true, allowedTypes: ['POST'] } },
        taskBoard: {},
      },
    });
    boardId = board.data!.createCalloutOnCalloutsSet.id;
    expect(board.data!.createCalloutOnCalloutsSet.taskColumnCounts.map(c => c.column)).toEqual([
      'Backlog',
      'To do',
      'In progress',
      'Done',
    ]);

    // Member A creates a task in Backlog (mover B must differ from creator A).
    const task = await gql<{
      createContributionOnCallout: {
        id: string;
        post: { id: string };
        classification: { tagsets: Array<{ name: string; tags: string[] }> };
      };
    }>(TOKENS.a, CREATE_CONTRIB, {
      d: {
        calloutID: boardId,
        type: 'POST',
        taskColumn: 'Backlog',
        post: { profileData: { displayName: 'Task by A' } },
      },
    });
    taskId = task.data!.createContributionOnCallout.id;
    taskPostId = task.data!.createContributionOnCallout.post.id;
    expect(task.data!.createContributionOnCallout.classification.tagsets[0].tags).toEqual(['Backlog']);

    // A plain (non-board) posts callout + contribution for .
    const plain = await gql<{ createCalloutOnCalloutsSet: { id: string; taskColumnCounts: null } }>(
      TOKENS.admin,
      CREATE_CALLOUT,
      {
        d: {
          calloutsSetID: CALLOUTS_SET,
          framing: { profile: { displayName: `TaskBoard Plain ${Date.now()}` } },
          settings: { visibility: 'PUBLISHED', contribution: { enabled: true, allowedTypes: ['POST'] } },
        },
      }
    );
    expect(plain.data!.createCalloutOnCalloutsSet.taskColumnCounts).toBeNull();
    const plainContrib = await gql<{ createContributionOnCallout: { id: string; classification: null } }>(
      TOKENS.admin,
      CREATE_CONTRIB,
      {
        d: {
          calloutID: plain.data!.createCalloutOnCalloutsSet.id,
          type: 'POST',
          post: { profileData: { displayName: 'Plain post' } },
        },
      }
    );
    plainContribId = plainContrib.data!.createContributionOnCallout.id;
    // non-board contributions receive no column classification.
    expect(plainContrib.data!.createContributionOnCallout.classification).toBeNull();
  });

  test("member B (non-admin, non-creator) moves A's task; counters update; persists", async ({ page }) => {
    const before = await gql<{ lookup: { callout: { taskColumnCounts: Array<{ column: string; count: number }> } } }>(
      TOKENS.b,
      COUNTS,
      { id: boardId }
    );
    expect(countMap(before.data!.lookup.callout.taskColumnCounts).Backlog).toBe(1);

    const move = await gql<{ moveTaskToColumn: { classification: { tagsets: Array<{ tags: string[] }> } } }>(
      TOKENS.b,
      MOVE,
      {
        d: { column: 'In progress', contributionID: taskId },
      }
    );
    expect(move.errors).toBeUndefined();
    expect(move.data!.moveTaskToColumn.classification.tagsets[0].tags).toEqual(['In progress']);

    const after = await gql<{ lookup: { callout: { taskColumnCounts: Array<{ column: string; count: number }> } } }>(
      TOKENS.b,
      COUNTS,
      { id: boardId }
    );
    const m = countMap(after.data!.lookup.callout.taskColumnCounts);
    expect(m.Backlog).toBe(0);
    expect(m['In progress']).toBe(1);

    // Persists for all viewers: the board UI shows the card under In progress.
    if (SPACE_URL) {
      await page.goto(SPACE_URL);
      const inProgress = page.getByText('In progress', { exact: true }).locator('..');
      await expect(inProgress).toContainText('Task by A');
      await expect(inProgress).toContainText('1');
    }
  });

  test('non-member move is denied; nothing changes', async () => {
    const res = await gql(TOKENS.c, MOVE, { d: { column: 'To do', contributionID: taskId } });
    expect(res.data ?? null).toBeNull();
    expect(res.errors![0].message).toMatch(/move-task|read|Authorization/i);

    const col = await gql<{ lookup: { contribution: { classification: { tagsets: Array<{ tags: string[] }> } } } }>(
      TOKENS.b,
      CONTRIB_COLUMN,
      { id: taskId }
    );
    expect(col.data!.lookup.contribution.classification.tagsets[0].tags).toEqual(['In progress']);
  });

  test("MOVE_TASK holder cannot edit another member's post content", async () => {
    const res = await gql(TOKENS.b, UPDATE_POST, {
      d: { ID: taskPostId, profileData: { displayName: 'HACKED by B' } },
    });
    expect(res.data ?? null).toBeNull();
    expect(res.errors![0].message).toMatch(/update/i);
  });

  test('moving to the current column is an idempotent no-op', async () => {
    await gql(TOKENS.b, MOVE, { d: { column: 'Done', contributionID: taskId } });
    const first = await gql<{ lookup: { callout: { taskColumnCounts: Array<{ column: string; count: number }> } } }>(
      TOKENS.b,
      COUNTS,
      { id: boardId }
    );
    expect(countMap(first.data!.lookup.callout.taskColumnCounts).Done).toBe(1);

    const again = await gql<{ moveTaskToColumn: { classification: { tagsets: Array<{ tags: string[] }> } } }>(
      TOKENS.b,
      MOVE,
      { d: { column: 'Done', contributionID: taskId } }
    );
    expect(again.errors).toBeUndefined();
    expect(again.data!.moveTaskToColumn.classification.tagsets[0].tags).toEqual(['Done']);
    const after = await gql<{ lookup: { callout: { taskColumnCounts: Array<{ column: string; count: number }> } } }>(
      TOKENS.b,
      COUNTS,
      { id: boardId }
    );
    expect(countMap(after.data!.lookup.callout.taskColumnCounts).Done).toBe(1);
  });

  test('a non-existent column is rejected; the task keeps its column', async () => {
    const res = await gql(TOKENS.b, MOVE, { d: { column: 'Nonsense', contributionID: taskId } });
    expect(res.data ?? null).toBeNull();
    expect(res.errors![0].extensions?.code).toBe('BAD_USER_INPUT');
    const col = await gql<{ lookup: { contribution: { classification: { tagsets: Array<{ tags: string[] }> } } } }>(
      TOKENS.b,
      CONTRIB_COLUMN,
      { id: taskId }
    );
    expect(col.data!.lookup.contribution.classification.tagsets[0].tags).toEqual(['Done']);
  });

  test('move on a non-board callout contribution is rejected (even for admin)', async () => {
    const res = await gql(TOKENS.admin, MOVE, { d: { column: 'Backlog', contributionID: plainContribId } });
    expect(res.data ?? null).toBeNull();
    // MOVE_TASK is never granted on non-board callouts.
    expect(res.errors![0].message).toMatch(/move-task|not a Tasks board|Authorization/i);
  });

  test('concurrent moves converge to exactly one column; none lost', async () => {
    for (let i = 0; i < 4; i++) {
      await gql(TOKENS.b, MOVE, { d: { column: 'Backlog', contributionID: taskId } });
      const [rb, ra] = await Promise.all([
        gql(TOKENS.b, MOVE, { d: { column: 'To do', contributionID: taskId } }),
        gql(TOKENS.a, MOVE, { d: { column: 'In progress', contributionID: taskId } }),
      ]);
      // Both land (deterministic last-write-wins, no lost update / deadlock).
      expect(rb.errors, `race B run ${i}`).toBeUndefined();
      expect(ra.errors, `race A run ${i}`).toBeUndefined();

      const final = await gql<{ lookup: { contribution: { classification: { tagsets: Array<{ tags: string[] }> } } } }>(
        TOKENS.b,
        CONTRIB_COLUMN,
        { id: taskId }
      );
      const col = final.data!.lookup.contribution.classification.tagsets[0].tags;
      expect(col).toHaveLength(1);
      expect(['To do', 'In progress']).toContain(col[0]);

      const counts = await gql<{ lookup: { callout: { taskColumnCounts: Array<{ column: string; count: number }> } } }>(
        TOKENS.b,
        COUNTS,
        { id: boardId }
      );
      const total = counts.data!.lookup.callout.taskColumnCounts.reduce((s, c) => s + c.count, 0);
      expect(total, `total after race run ${i}`).toBe(1);
    }
  });
});
