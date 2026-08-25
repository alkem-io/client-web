import { expect, request, test } from '@playwright/test';

/**
 * Configure the board's columns
 * @forge-acceptance
 *
 * Durable regression of the acceptance walk. Mirrors the manual verifier
 * scenario-for-scenario. The load-bearing guarantees are the four
 * discrete, UPDATE-gated column mutations (create / rename / reorder / delete),
 * their name validation (trim / non-empty / <=128 / comma-free /
 * case-insensitive-unique), the transactional delete-reflow onto the FIRST
 * column (which is itself non-deletable), rename re-pointing tasks in the same
 * transaction, and the move-vs-delete race resolving deterministically with no
 * task ever stranded on a deleted column and none lost.
 *
 * Auth model: the private GraphQL endpoint validates a Hydra-issued JWT (JWS).
 * Tokens are obtained out-of-band (OIDC Authorization Code + PKCE — see
 * server/.scripts/lib/kratos.sh `oidc_login_jwt`) and injected via env so this
 * spec has no dependency on browser SSO (which short-circuits to the first
 * active Hydra session in a shared dev stack). Seed actors:
 * TB_TOKEN_ADMIN — platform admin / space admin (holds UPDATE on the board)
 * TB_TOKEN_B — plain space MEMBER (holds MOVE_TASK, but NOT UPDATE)
 * TB_CALLOUTS_SET — the space collaboration calloutsSet id
 * TB_WEB_ORIGIN — gateway origin (default http://localhost:3000); NEVER :3001
 *
 * Deterministic, no sleeps: all waits are Playwright auto-waits / expect polling.
 */

const GQL = `${process.env.TB_WEB_ORIGIN ?? 'http://localhost:3000'}/api/private/non-interactive/graphql`;
const CALLOUTS_SET = process.env.TB_CALLOUTS_SET ?? '';

const TOKENS = {
  admin: process.env.TB_TOKEN_ADMIN ?? '',
  b: process.env.TB_TOKEN_B ?? '',
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
      classification { tagsets { name tags } }
    }
  }`;

const CREATE_COLUMN = /* GraphQL */ `
  mutation ($d: CreateTaskColumnOnCalloutInput!) {
    createTaskColumnOnCallout(columnData: $d) {
      classification { tagsets { name allowedValues } }
    }
  }`;

const UPDATE_COLUMN = /* GraphQL */ `
  mutation ($d: UpdateTaskColumnOnCalloutInput!) {
    updateTaskColumnOnCallout(columnData: $d) {
      classification { tagsets { name allowedValues } }
    }
  }`;

const REORDER_COLUMNS = /* GraphQL */ `
  mutation ($d: UpdateTaskColumnsSortOrderOnCalloutInput!) {
    updateTaskColumnsSortOrderOnCallout(sortOrderData: $d) {
      classification { tagsets { name allowedValues } }
    }
  }`;

const DELETE_COLUMN = /* GraphQL */ `
  mutation ($d: DeleteTaskColumnOnCalloutInput!) {
    deleteTaskColumnOnCallout(columnData: $d) {
      classification { tagsets { name allowedValues } }
    }
  }`;

const MOVE = /* GraphQL */ `
  mutation ($d: MoveTaskToColumnInput!) {
    moveTaskToColumn(moveData: $d) { id classification { tagsets { name tags } } }
  }`;

const CALLOUT_COLUMNS = /* GraphQL */ `
  query ($id: UUID!) {
    lookup { callout(ID: $id) { classification { tagsets { name allowedValues } } taskColumnCounts { column count } } }
  }`;

const CONTRIB_COLUMN = /* GraphQL */ `
  query ($id: UUID!) { lookup { contribution(ID: $id) { classification { tagsets { name tags } } } } }`;

function taskColumns(tagsets: Array<{ name: string; allowedValues: string[] }>): string[] {
  return tagsets.find(t => t.name === 'task')!.allowedValues;
}
function taskTag(tagsets: Array<{ name: string; tags: string[] }>): string[] {
  return tagsets.find(t => t.name === 'task')!.tags;
}
async function columnsOf(token: string, id: string): Promise<string[]> {
  const r = await gql<{
    lookup: { callout: { classification: { tagsets: Array<{ name: string; allowedValues: string[] }> } } };
  }>(token, CALLOUT_COLUMNS, { id });
  return taskColumns(r.data!.lookup.callout.classification.tagsets);
}
async function contribColumn(token: string, id: string): Promise<string[]> {
  const r = await gql<{
    lookup: { contribution: { classification: { tagsets: Array<{ name: string; tags: string[] }> } } };
  }>(token, CONTRIB_COLUMN, { id });
  return taskTag(r.data!.lookup.contribution.classification.tagsets);
}

test.describe('@forge-acceptance configure the board columns', () => {
  test.skip(
    !TOKENS.admin || !TOKENS.b || !CALLOUTS_SET,
    'Requires TB_TOKEN_ADMIN + TB_TOKEN_B (plain member) + TB_CALLOUTS_SET (see header). Obtain JWTs via oidc_login_jwt.'
  );

  let boardId: string;

  test.beforeAll(async () => {
    const board = await gql<{
      createCalloutOnCalloutsSet: {
        id: string;
        classification: { tagsets: Array<{ name: string; allowedValues: string[] }> };
      };
    }>(TOKENS.admin, CREATE_CALLOUT, {
      d: {
        calloutsSetID: CALLOUTS_SET,
        framing: { profile: { displayName: `TaskBoard Board ${Date.now()}` } },
        settings: { visibility: 'PUBLISHED', contribution: { enabled: true, allowedTypes: ['POST'] } },
        taskBoard: {},
      },
    });
    boardId = board.data!.createCalloutOnCalloutsSet.id;
    // A fresh board opens with the 4 default columns in order.
    expect(taskColumns(board.data!.createCalloutOnCalloutsSet.classification.tagsets)).toEqual([
      'Backlog',
      'To do',
      'In progress',
      'Done',
    ]);
  });

  test('admin adds a column; it appends after the existing ones', async () => {
    const res = await gql<{
      createTaskColumnOnCallout: { classification: { tagsets: Array<{ name: string; allowedValues: string[] }> } };
    }>(TOKENS.admin, CREATE_COLUMN, { d: { calloutID: boardId, name: 'Review' } });
    expect(res.errors).toBeUndefined();
    expect(taskColumns(res.data!.createTaskColumnOnCallout.classification.tagsets)).toEqual([
      'Backlog',
      'To do',
      'In progress',
      'Done',
      'Review',
    ]);
  });

  test('admin renames a column; existing tasks in it follow, in the same transaction', async () => {
    // Seed a task into "Backlog" so the rename must re-point it.
    const task = await gql<{
      createContributionOnCallout: { id: string; classification: { tagsets: Array<{ name: string; tags: string[] }> } };
    }>(TOKENS.admin, CREATE_CONTRIB, {
      d: {
        calloutID: boardId,
        type: 'POST',
        taskColumn: 'Backlog',
        post: { profileData: { displayName: 'Task in Backlog' } },
      },
    });
    const taskId = task.data!.createContributionOnCallout.id;
    expect(taskTag(task.data!.createContributionOnCallout.classification.tagsets)).toEqual(['Backlog']);

    const res = await gql<{
      updateTaskColumnOnCallout: { classification: { tagsets: Array<{ name: string; allowedValues: string[] }> } };
    }>(TOKENS.admin, UPDATE_COLUMN, { d: { calloutID: boardId, currentName: 'Backlog', newName: 'Icebox' } });
    expect(res.errors).toBeUndefined();
    const cols = taskColumns(res.data!.updateTaskColumnOnCallout.classification.tagsets);
    expect(cols).toContain('Icebox');
    expect(cols).not.toContain('Backlog');
    // The task moved with the rename — atomically, no orphaned "Backlog" tag.
    await expect.poll(() => contribColumn(TOKENS.admin, taskId)).toEqual(['Icebox']);

    // Restore the name so later scenarios read against a known ordering.
    await gql(TOKENS.admin, UPDATE_COLUMN, { d: { calloutID: boardId, currentName: 'Icebox', newName: 'Backlog' } });
  });

  test('admin reorders columns; the new order is authoritative', async () => {
    const target = ['Done', 'In progress', 'To do', 'Backlog', 'Review'];
    const res = await gql<{
      updateTaskColumnsSortOrderOnCallout: {
        classification: { tagsets: Array<{ name: string; allowedValues: string[] }> };
      };
    }>(TOKENS.admin, REORDER_COLUMNS, { d: { calloutID: boardId, columnNames: target } });
    expect(res.errors).toBeUndefined();
    expect(taskColumns(res.data!.updateTaskColumnsSortOrderOnCallout.classification.tagsets)).toEqual(target);
    await expect.poll(() => columnsOf(TOKENS.admin, boardId)).toEqual(target);
  });

  test('deleting a non-first column reflows its tasks onto the first column', async () => {
    // First column is currently "Done" (from ). Put a task in "Review", then delete "Review".
    const task = await gql<{ createContributionOnCallout: { id: string } }>(TOKENS.admin, CREATE_CONTRIB, {
      d: {
        calloutID: boardId,
        type: 'POST',
        taskColumn: 'Review',
        post: { profileData: { displayName: 'Task in Review' } },
      },
    });
    const taskId = task.data!.createContributionOnCallout.id;
    await expect.poll(() => contribColumn(TOKENS.admin, taskId)).toEqual(['Review']);

    const first = (await columnsOf(TOKENS.admin, boardId))[0];
    const res = await gql<{
      deleteTaskColumnOnCallout: { classification: { tagsets: Array<{ name: string; allowedValues: string[] }> } };
    }>(TOKENS.admin, DELETE_COLUMN, { d: { calloutID: boardId, name: 'Review' } });
    expect(res.errors).toBeUndefined();
    const cols = taskColumns(res.data!.deleteTaskColumnOnCallout.classification.tagsets);
    expect(cols).not.toContain('Review');
    // Its task reflowed onto the FIRST column, never left dangling.
    await expect.poll(() => contribColumn(TOKENS.admin, taskId)).toEqual([first]);

    // Restore "Review" for later scenarios.
    await gql(TOKENS.admin, CREATE_COLUMN, { d: { calloutID: boardId, name: 'Review' } });
  });

  test('the first column cannot be deleted (it is the reflow target)', async () => {
    const cols = await columnsOf(TOKENS.admin, boardId);
    const first = cols[0];
    const res = await gql(TOKENS.admin, DELETE_COLUMN, { d: { calloutID: boardId, name: first } });
    expect(res.data ?? null).toBeNull();
    expect(res.errors![0].message).toMatch(/first column|cannot.*delet|reflow/i);
    // Nothing changed.
    await expect.poll(() => columnsOf(TOKENS.admin, boardId)).toEqual(cols);
  });

  test('invalid column names are rejected (case-dup, comma, blank)', async () => {
    const cols = await columnsOf(TOKENS.admin, boardId);
    const existing = cols[1]; // any non-first existing column

    // Case-insensitive duplicate on create.
    const dup = await gql(TOKENS.admin, CREATE_COLUMN, { d: { calloutID: boardId, name: existing.toUpperCase() } });
    expect(dup.data ?? null).toBeNull();
    expect(dup.errors![0].message).toMatch(/exists|unique|duplicate/i);

    // Comma is forbidden (tagset value separator).
    const comma = await gql(TOKENS.admin, CREATE_COLUMN, { d: { calloutID: boardId, name: 'A,B' } });
    expect(comma.data ?? null).toBeNull();
    expect(comma.errors![0].message).toMatch(/comma|,|invalid/i);

    // Blank / whitespace-only.
    const blank = await gql(TOKENS.admin, CREATE_COLUMN, { d: { calloutID: boardId, name: '   ' } });
    expect(blank.data ?? null).toBeNull();
    expect(blank.errors![0].message).toMatch(/empty|blank|required|invalid/i);

    // Board is untouched by any rejected create.
    await expect.poll(() => columnsOf(TOKENS.admin, boardId)).toEqual(cols);
  });

  test('a plain member (MOVE_TASK, no UPDATE) cannot create/rename/reorder/delete columns', async () => {
    const cols = await columnsOf(TOKENS.admin, boardId);

    const create = await gql(TOKENS.b, CREATE_COLUMN, { d: { calloutID: boardId, name: 'MemberCol' } });
    expect(create.data ?? null).toBeNull();
    expect(create.errors![0].message).toMatch(/update|Authorization/i);

    const rename = await gql(TOKENS.b, UPDATE_COLUMN, {
      d: { calloutID: boardId, currentName: cols[1], newName: 'MemberRenamed' },
    });
    expect(rename.data ?? null).toBeNull();
    expect(rename.errors![0].message).toMatch(/update|Authorization/i);

    const reorder = await gql(TOKENS.b, REORDER_COLUMNS, {
      d: { calloutID: boardId, columnNames: [...cols].reverse() },
    });
    expect(reorder.data ?? null).toBeNull();
    expect(reorder.errors![0].message).toMatch(/update|Authorization/i);

    const del = await gql(TOKENS.b, DELETE_COLUMN, { d: { calloutID: boardId, name: cols[1] } });
    expect(del.data ?? null).toBeNull();
    expect(del.errors![0].message).toMatch(/update|Authorization/i);

    // Columns are exactly as the admin left them — no member write leaked through.
    await expect.poll(() => columnsOf(TOKENS.admin, boardId)).toEqual(cols);
  });

  test('member move racing admin delete of that column is deterministic; no task stranded or lost', async () => {
    // "Review" is present (restored in ). first column is the reflow target.
    for (let i = 0; i < 6; i++) {
      if (!(await columnsOf(TOKENS.admin, boardId)).includes('Review')) {
        await gql(TOKENS.admin, CREATE_COLUMN, { d: { calloutID: boardId, name: 'Review' } });
      }
      const cols = await columnsOf(TOKENS.admin, boardId);
      const first = cols[0];

      const task = await gql<{ createContributionOnCallout: { id: string } }>(TOKENS.admin, CREATE_CONTRIB, {
        d: {
          calloutID: boardId,
          type: 'POST',
          taskColumn: first,
          post: { profileData: { displayName: `Racer ${i}` } },
        },
      });
      const taskId = task.data!.createContributionOnCallout.id;

      // Race: member moves the task INTO "Review" while admin deletes "Review".
      const [, del] = await Promise.all([
        gql(TOKENS.b, MOVE, { d: { column: 'Review', contributionID: taskId } }),
        gql(TOKENS.admin, DELETE_COLUMN, { d: { calloutID: boardId, name: 'Review' } }),
      ]);
      // The delete serialises with the move; at least one path resolves cleanly and
      // the move is never allowed to persist a deleted column value.
      expect(del.errors, `delete run ${i}`).toBeUndefined();

      const finalCols = await columnsOf(TOKENS.admin, boardId);
      const reviewGone = !finalCols.includes('Review');
      const col = await contribColumn(TOKENS.admin, taskId);

      // Exactly one column, always a live one, NEVER the deleted "Review", NEVER lost.
      expect(col, `run ${i} tag cardinality`).toHaveLength(1);
      expect(finalCols, `run ${i} live column`).toContain(col[0]);
      if (reviewGone) {
        expect(col[0], `run ${i} not stranded on deleted column`).not.toBe('Review');
        // Reflowed to the first column when the delete won.
        expect(col[0], `run ${i} reflow target`).toBe(first);
      }
    }
  });
});
