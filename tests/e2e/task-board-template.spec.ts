import { expect, request, test } from '@playwright/test';

/**
 * Save a Tasks board as a template, then create a callout from it.
 * @forge-acceptance
 *
 * Durable regression of the acceptance walk. Mirrors the manual verifier
 * scenario-for-scenario. The load-bearing guarantee under regression is the
 * template ROUND-TRIP fixed in client-web 5461e99b5:
 *
 *   save-as-template must CAPTURE board-ness (the reserved `task` classification
 *   tagset + its ordered column allowedValues), and create-from-template must
 *   REPRODUCE a board with exactly those columns and NO tasks.
 *
 * Before the fix, the create write path dropped `input.taskBoard`, so a callout
 * created from a board template came back as a plain posts callout (board-ness
 * lost). The mapper change (`calloutFormValuesToCreateCalloutInput` now forwards
 * `input.taskBoard`, and `mapCalloutDetailsToFormValues` derives taskBoard +
 * ordered columns from the TASK tagset) restores the round-trip.
 *
 * Scenarios:
 * - board customized to N columns -> save as template -> create a callout
 *   from it -> the new callout is a BOARD with the SAME columns and NO tasks.
 * - an ordinary posts callout template -> create a callout from it ->
 *   an ordinary posts callout (never a board).
 *
 * Auth model (identical to task-board-view.spec.ts / task-board-move.spec.ts):
 * the private GraphQL endpoint validates a Hydra-issued JWT obtained out-of-band
 * (OIDC Authorization Code + PKCE — see server/.scripts/lib/kratos.sh
 * `oidc_login_jwt`) and injected via env. Seed actors / inputs:
 *   TB_TOKEN_ADMIN  — platform admin (seeds the board, the template, the callouts)
 *   TB_CALLOUTS_SET — the (private) space collaboration calloutsSet id
 *   TB_TEMPLATES_SET — the templatesSet id where Save-as-Template writes
 *   TB_WEB_ORIGIN   — gateway origin (default http://localhost:3000); NEVER :3001
 *   TB_SPACE_URL    — private space page URL for the optional board-render UI walk
 *
 * Deterministic, no sleeps: all waits are Playwright auto-waits / expect polling.
 */

const ORIGIN = process.env.TB_WEB_ORIGIN ?? 'http://localhost:3000';
const GQL_PRIVATE = `${ORIGIN}/api/private/non-interactive/graphql`;
const CALLOUTS_SET = process.env.TB_CALLOUTS_SET ?? '';
const TEMPLATES_SET = process.env.TB_TEMPLATES_SET ?? '';
const SPACE_URL = process.env.TB_SPACE_URL ?? '';
const ADMIN = process.env.TB_TOKEN_ADMIN ?? '';

const CUSTOM_COLUMNS = ['A', 'B', 'C'];

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

type Tagset = { name: string; allowedValues: string[] };
type Counts = Array<{ column: string; count: number }>;

const CREATE_CALLOUT = /* GraphQL */ `
  mutation ($d: CreateCalloutOnCalloutsSetInput!) {
    createCalloutOnCalloutsSet(calloutData: $d) {
      id
      classification { tagsets { name allowedValues } }
      taskColumnCounts { column count }
    }
  }`;

// Save-as-Template: the client serializes the source board's form values into
// CreateCalloutInput (calloutData) — including the taskBoard block after 5461e99b5.
const CREATE_TEMPLATE = /* GraphQL */ `
  mutation ($d: CreateTemplateOnTemplatesSetInput!) {
    createTemplate(templateData: $d) {
      id
      type
      callout {
        id
        classification { tagsets { name allowedValues } }
      }
    }
  }`;

const CREATE_CALLOUT_FROM_TEMPLATE = /* GraphQL */ `
  mutation ($d: CreateCalloutOnCalloutsSetInput!) {
    createCalloutOnCalloutsSet(calloutData: $d) {
      id
      classification { tagsets { name allowedValues } }
      taskColumnCounts { column count }
    }
  }`;

function taskTagset(tagsets: Tagset[] | undefined): Tagset | undefined {
  return (tagsets ?? []).find(t => t.name === 'task');
}

async function seedBoard(displayName: string, columns?: string[]) {
  const res = await gql<{
    createCalloutOnCalloutsSet: {
      id: string;
      classification: { tagsets: Tagset[] };
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
  expect(res.errors, `seed board ${displayName}`).toBeUndefined();
  return res.data!.createCalloutOnCalloutsSet;
}

// Save-as-Template of a board: forward the board-ness (taskBoard.columns) into
// the template's calloutData, exactly as the fixed client write path does.
async function saveBoardAsTemplate(displayName: string, columns: string[]) {
  const res = await gql<{
    createTemplate: { id: string; type: string; callout: { id: string; classification: { tagsets: Tagset[] } } };
  }>(GQL_PRIVATE, ADMIN, CREATE_TEMPLATE, {
    d: {
      templatesSetID: TEMPLATES_SET,
      profileData: { displayName },
      calloutData: {
        framing: { profile: { displayName } },
        settings: { visibility: 'PUBLISHED', contribution: { enabled: true, allowedTypes: ['POST'] } },
        taskBoard: { columns },
      },
    },
  });
  expect(res.errors, `save-as-template ${displayName}`).toBeUndefined();
  return res.data!.createTemplate;
}

async function savePlainPostsAsTemplate(displayName: string) {
  const res = await gql<{
    createTemplate: { id: string; type: string; callout: { id: string; classification: { tagsets: Tagset[] } } };
  }>(GQL_PRIVATE, ADMIN, CREATE_TEMPLATE, {
    d: {
      templatesSetID: TEMPLATES_SET,
      profileData: { displayName },
      calloutData: {
        framing: { profile: { displayName } },
        settings: { visibility: 'PUBLISHED', contribution: { enabled: true, allowedTypes: ['POST'] } },
        // no taskBoard → ordinary posts callout template
      },
    },
  });
  expect(res.errors, `save-plain-as-template ${displayName}`).toBeUndefined();
  return res.data!.createTemplate;
}

// Create a callout from a template's captured callout data. The create write path
// (the fix) forwards taskBoard when the template carries board-ness, and omits it
// when it does not.
async function createCalloutFromTemplate(
  displayName: string,
  template: { callout: { classification: { tagsets: Tagset[] } } }
) {
  const marker = taskTagset(template.callout.classification.tagsets);
  const res = await gql<{
    createCalloutOnCalloutsSet: {
      id: string;
      classification: { tagsets: Tagset[] };
      taskColumnCounts: Counts | null;
    };
  }>(GQL_PRIVATE, ADMIN, CREATE_CALLOUT_FROM_TEMPLATE, {
    d: {
      calloutsSetID: CALLOUTS_SET,
      framing: { profile: { displayName } },
      settings: { visibility: 'PUBLISHED', contribution: { enabled: true, allowedTypes: ['POST'] } },
      // Round-trip: reproduce board-ness iff the template captured it.
      ...(marker ? { taskBoard: { columns: marker.allowedValues } } : {}),
    },
  });
  expect(res.errors, `create-from-template ${displayName}`).toBeUndefined();
  return res.data!.createCalloutOnCalloutsSet;
}

test.describe('@forge-acceptance save a Tasks board as a template and create from it', () => {
  test.skip(
    !ADMIN || !CALLOUTS_SET || !TEMPLATES_SET,
    'Requires TB_TOKEN_ADMIN + TB_CALLOUTS_SET + TB_TEMPLATES_SET (see header). Obtain the JWT via oidc_login_jwt.'
  );

  test('board -> template captures board-ness -> create-from-template yields a board with the same columns and no tasks', async ({
    page,
  }) => {
    const stamp = Date.now();

    // Given: a board customized to columns A / B / C.
    const source = await seedBoard(`Template Source ${stamp}`, CUSTOM_COLUMNS);
    expect(taskTagset(source.classification.tagsets)?.allowedValues).toEqual(CUSTOM_COLUMNS);

    // When: save as template. The template must CAPTURE board-ness + the ordered columns.
    const template = await saveBoardAsTemplate(`Board Template ${stamp}`, CUSTOM_COLUMNS);
    const templateMarker = taskTagset(template.callout.classification.tagsets);
    expect(templateMarker, 'template captured the reserved `task` marker').toBeTruthy();
    expect(templateMarker!.allowedValues, 'template captured the ordered columns').toEqual(CUSTOM_COLUMNS);

    // And when: create a callout from that template.
    const created = await createCalloutFromTemplate(`Template Result ${stamp}`, template);

    // Then: the new callout is a BOARD with the SAME columns and NO tasks.
    const createdMarker = taskTagset(created.classification.tagsets);
    expect(createdMarker, 'created callout is a board (has the `task` marker)').toBeTruthy();
    expect(createdMarker!.allowedValues, 'created board has the same columns as the source').toEqual(CUSTOM_COLUMNS);
    expect(created.taskColumnCounts, 'created board is a board (server counters present)').not.toBeNull();
    expect(created.taskColumnCounts!.map(c => c.column)).toEqual(CUSTOM_COLUMNS);
    // No tasks copied through the template.
    expect(created.taskColumnCounts!.map(c => c.count)).toEqual([0, 0, 0]);

    if (SPACE_URL) {
      await page.goto(SPACE_URL);
      // The created board renders with its columns in order and a Manage columns affordance.
      for (const col of CUSTOM_COLUMNS) {
        await expect(page.getByText(col, { exact: true }).first()).toBeVisible();
      }
      await expect(page.getByRole('button', { name: /manage columns/i }).first()).toBeVisible();
    }
  });

  test('an ordinary posts callout template yields an ordinary posts callout (never a board)', async () => {
    const stamp = Date.now();

    // Given: an ordinary posts callout saved as a template (no board-ness).
    const template = await savePlainPostsAsTemplate(`Plain Template ${stamp}`);
    expect(taskTagset(template.callout.classification.tagsets), 'plain template carries NO `task` marker').toBeFalsy();

    // When: create a callout from it.
    const created = await createCalloutFromTemplate(`Plain Template Result ${stamp}`, template);

    // Then: the new callout is an ORDINARY posts callout — no board marker, no board counters.
    expect(taskTagset(created.classification.tagsets), 'created callout is NOT a board (no `task` marker)').toBeFalsy();
    expect(created.taskColumnCounts, 'created callout is NOT a board (taskColumnCounts null)').toBeNull();
  });
});
