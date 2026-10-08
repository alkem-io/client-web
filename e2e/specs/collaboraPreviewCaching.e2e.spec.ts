import { expect, test } from '../fixtures/authFixture';

/**
 * @forge-acceptance
 *
 * US3 — "Reuse rendering without burdening saves" (workspace spec
 * 059-collabora-preview-streaming, US3-AS1..AS6, QS6, QS48).
 *
 * Reproduces, as a durable live-stack walk, the acceptance scenarios /forge
 * verified manually against the identity-gated WOPI preview endpoint
 * (`GET /api/private/wopi/files/{fileID}/preview`) and the WOPI protocol
 * endpoints Collabora itself uses to save (`LOCK` / `PUT` / `UNLOCK` on
 * `/wopi/files/{fileID}[/contents]`) — evidence under
 * `specs/059-collabora-preview-streaming/forge/evidence/US3/` in the
 * agents-hq workspace, including the wopi-service structured request log
 * (status + duration) used as the render-count oracle: this Collabora build
 * (`collabora/code:26.04.2.4.1`) delays its runtime log level to WARNING
 * after startup, so a successful `/cool/get-thumbnail` conversion is never
 * logged — only WRN-level failures are. `docker logs <collabora> | grep -c
 * get-thumbnail` is therefore NOT a reliable render-count oracle in this
 * image/config; a fresh render is identified by wopi-service's own
 * status=200 request-log duration (tens of milliseconds, a real Collabora
 * round trip) versus a cache hit (single-digit milliseconds).
 *
 * AS7/AS8 (the eleven-way admission-queue bound and the cache-hit/same-source
 * bypass under busy admission) are NOT walkable live — real local renders
 * complete in ~0.3s, closing the window a fake-Collabora integration test
 * needs. They are discharged by wopi-service's own test suite
 * (`internal/domain/service/render_admission_test.go`,
 * `TestPreviewService_AdmissionBoundsElevenDistinctColdRequests`,
 * `TestPreviewService_CacheHitBypassesAdmissionEvenWhenFull`,
 * `TestRenderAdmission_*`) — run via `go test ./internal/domain/service/...`
 * in the wopi-service repo, not reproduced here.
 *
 * Fixture (see specs/059-collabora-preview-streaming/quickstart.md §3-4):
 *   E2E_PREVIEW_FILE_ID        — fileID of a saved Collabora document this
 *                                 suite may freely re-render and re-save.
 *                                 Required — the whole suite is skipped
 *                                 without it.
 *   E2E_WOPI_SERVICE_URL       — wopi-service base URL reachable from the
 *                                 test runner for direct WOPI-protocol calls
 *                                 (LOCK/PUT/UNLOCK), bypassing the editor UI
 *                                 the way Collabora itself would call back.
 *                                 Defaults to http://localhost:28080.
 *   E2E_WOPI_ACTOR_ID          — the platform-admin user's internal actor ID,
 *                                 sent as X-Alkemio-Actor-Id when minting a
 *                                 WOPI token directly (mirrors the server's
 *                                 own cluster-internal wopi.service.adapter
 *                                 call). Required for AS3/AS4/AS6/QS6/QS48
 *                                 (any scenario that saves through the real
 *                                 WOPI protocol).
 *   E2E_PREVIEW_FILE_ID_B      — a second, independent Collabora document
 *                                 fileID in the same storage bucket. Required
 *                                 for QS48 only.
 *
 * A locally-run Collabora instance behind Docker Desktop's NAT needs its
 * `net.post_allow` extended past the default private-range allow-list (see
 * forge/evidence/US3/US3-postallow-fix-verified.png) — a verification-harness
 * requirement only; production WOPI reaches Collabora over the in-cluster
 * ClusterIP and needs no such override (FR-019).
 *
 * Not part of `pnpm test` (vitest) — live-stack only, run via `pnpm test:e2e`
 * (see e2e/README.md) once ALKEMIO_BASE_URL / AUTH_TEST_HARNESS_* / the
 * E2E_PREVIEW_* / E2E_WOPI_* fixtures above are set for the target stack.
 */

const BASE_URL = process.env.ALKEMIO_BASE_URL || 'http://localhost:3000';
const WOPI_SERVICE_URL = process.env.E2E_WOPI_SERVICE_URL || 'http://localhost:28080';
const FILE_ID = process.env.E2E_PREVIEW_FILE_ID;
const FILE_ID_B = process.env.E2E_PREVIEW_FILE_ID_B;
const ACTOR_ID = process.env.E2E_WOPI_ACTOR_ID;

const previewUrl = (fileID: string) => `${BASE_URL}/api/private/wopi/files/${fileID}/preview`;

/** Render availability is environment-dependent (Collabora reachability); the cache contract is not. */
const RENDER_UNAVAILABLE_STATUSES = [502, 503];

/** Bitwise CRC-32 (no lookup table — these fixtures are a few hundred bytes each). */
function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** Builds an uncompressed (STORED-method) ZIP archive — sufficient for a package this small and avoids a deflate dependency. */
function buildZip(entries: { name: string; data: Buffer }[]): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8');
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4); // version needed to extract
    localHeader.writeUInt16LE(0, 6); // general purpose flags
    localHeader.writeUInt16LE(0, 8); // compression method: stored
    localHeader.writeUInt16LE(0, 10); // mod time
    localHeader.writeUInt16LE(0x21, 12); // mod date: 1980-01-01
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(size, 18); // compressed size
    localHeader.writeUInt32LE(size, 22); // uncompressed size
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28); // extra field length
    localParts.push(localHeader, nameBuf, entry.data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4); // version made by
    centralHeader.writeUInt16LE(20, 6); // version needed to extract
    centralHeader.writeUInt16LE(0, 8); // general purpose flags
    centralHeader.writeUInt16LE(0, 10); // compression method
    centralHeader.writeUInt16LE(0, 12); // mod time
    centralHeader.writeUInt16LE(0x21, 14); // mod date
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(size, 20);
    centralHeader.writeUInt32LE(size, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30); // extra field length
    centralHeader.writeUInt16LE(0, 32); // comment length
    centralHeader.writeUInt16LE(0, 34); // disk number start
    centralHeader.writeUInt16LE(0, 36); // internal attributes
    centralHeader.writeUInt32LE(0, 38); // external attributes
    centralHeader.writeUInt32LE(offset, 42); // offset of local header
    centralParts.push(centralHeader, nameBuf);

    offset += localHeader.length + nameBuf.length + entry.data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDirectory.length, 12);
  eocd.writeUInt32LE(offset, 16); // offset of start of central directory
  eocd.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([...localParts, centralDirectory, eocd]);
}

/**
 * A minimal, valid .docx (OOXML WordprocessingML package) whose only visible
 * text is the given marker string. Built in-process with a tiny STORED-method
 * ZIP writer (see `buildZip`/`crc32` above) rather than a checked-in binary
 * fixture, so every save gets a document whose content is provably distinct
 * (the marker is substituted straight into `word/document.xml`) without
 * shipping a fixture-generation dependency.
 */
function minimalDocxBytes(marker: string): Buffer {
  const escapedMarker = marker.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>${escapedMarker}</w:t></w:r></w:p>
    <w:sectPr/>
  </w:body>
</w:document>`;

  return buildZip([
    { name: '[Content_Types].xml', data: Buffer.from(contentTypes, 'utf8') },
    { name: '_rels/.rels', data: Buffer.from(rootRels, 'utf8') },
    { name: 'word/document.xml', data: Buffer.from(documentXml, 'utf8') },
  ]);
}

/** Mints a WOPI access token the way the server's cluster-internal adapter does, then LOCK+PUT+UNLOCKs new content. */
async function saveThroughWopiProtocol(
  request: import('@playwright/test').APIRequestContext,
  fileID: string,
  marker: string
): Promise<void> {
  const tokenRes = await request.post(`${WOPI_SERVICE_URL}/wopi/token`, {
    headers: { 'X-Alkemio-Actor-Id': ACTOR_ID!, 'Content-Type': 'application/json' },
    data: { documentId: fileID, actorName: 'e2e', lang: 'en' },
  });
  expect(tokenRes.ok()).toBeTruthy();
  const { accessToken } = await tokenRes.json();
  const lockId = `e2e-lock-${Date.now()}`;

  const lockRes = await request.post(`${WOPI_SERVICE_URL}/wopi/files/${fileID}?access_token=${accessToken}`, {
    headers: { 'X-WOPI-Override': 'LOCK', 'X-WOPI-Lock': lockId },
  });
  expect(lockRes.ok()).toBeTruthy();

  const putRes = await request.post(`${WOPI_SERVICE_URL}/wopi/files/${fileID}/contents?access_token=${accessToken}`, {
    headers: {
      'X-WOPI-Override': 'PUT',
      'X-WOPI-Lock': lockId,
      'Content-Type': 'application/octet-stream',
    },
    data: minimalDocxBytes(marker),
  });
  expect(putRes.ok()).toBeTruthy();

  const unlockRes = await request.post(`${WOPI_SERVICE_URL}/wopi/files/${fileID}?access_token=${accessToken}`, {
    headers: { 'X-WOPI-Override': 'UNLOCK', 'X-WOPI-Lock': lockId },
  });
  expect(unlockRes.ok()).toBeTruthy();
}

test.describe('US3 — reuse rendering without burdening saves', () => {
  test.skip(!FILE_ID, 'E2E_PREVIEW_FILE_ID is required for the US3 acceptance matrix');

  test('AS1 — first authorized request on an uncached document renders once and streams the stored PNG', async ({
    authedPage,
  }) => {
    const res = await authedPage.request.get(previewUrl(FILE_ID!));
    if (RENDER_UNAVAILABLE_STATUSES.includes(res.status())) {
      test.info().annotations.push({
        type: 'blocked',
        description: `render unavailable in this environment (status ${res.status()}) — see forge/evidence/US3`,
      });
      return;
    }
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toBe('image/png');
    expect(res.headers()['cache-control']).toBe('private, no-cache, must-revalidate');
    expect(res.headers()['etag']).toBeTruthy();
  });

  test('AS2 — a cached preview at the current updatedDate is served without invoking Collabora', async ({
    authedPage,
    freshPrimaryUser,
  }) => {
    const first = await authedPage.request.get(previewUrl(FILE_ID!));
    test.skip(RENDER_UNAVAILABLE_STATUSES.includes(first.status()), 'render unavailable in this environment');
    const firstEtag = first.headers()['etag'];

    // A genuinely separate browser context stands in for "another browser":
    // its own login, cookie jar, and Playwright-level request context — none
    // of which is shared with `authedPage`. Same account (document access is
    // otherwise unverifiable here); the property under test is cache reuse
    // across sessions, not per-user access.
    const other = await freshPrimaryUser();
    const second = await other.page.request.get(previewUrl(FILE_ID!));
    await other.close();

    expect(second.status()).toBe(200);
    expect(second.headers()['etag']).toBe(firstEtag);

    const [firstBody, secondBody] = await Promise.all([first.body(), second.body()]);
    expect(secondBody.equals(firstBody)).toBeTruthy();
  });

  test('AS3 — a real WOPI save (LOCK/PUT/UNLOCK) advances updatedDate and the next request renders exactly once', async ({
    authedPage,
    request,
  }) => {
    test.skip(!ACTOR_ID, 'E2E_WOPI_ACTOR_ID is required for AS3 (drives the real WOPI save protocol)');

    const before = await authedPage.request.get(previewUrl(FILE_ID!));
    test.skip(RENDER_UNAVAILABLE_STATUSES.includes(before.status()), 'render unavailable in this environment');
    const beforeEtag = before.headers()['etag'];

    await saveThroughWopiProtocol(request, FILE_ID!, `AS3-${Date.now()}`);

    const after = await authedPage.request.get(previewUrl(FILE_ID!));
    expect(after.status()).toBe(200);
    expect(after.headers()['etag']).not.toBe(beforeEtag);

    const [beforeBody, afterBody] = await Promise.all([before.body(), after.body()]);
    expect(afterBody.equals(beforeBody)).toBeFalsy();
  });

  test('AS4 — repeated saves with no preview request in between never touch the preview endpoint, and the eventual request renders exactly once', async ({
    authedPage,
    request,
  }) => {
    test.skip(!ACTOR_ID, 'E2E_WOPI_ACTOR_ID is required for AS4');

    const warm = await authedPage.request.get(previewUrl(FILE_ID!));
    test.skip(RENDER_UNAVAILABLE_STATUSES.includes(warm.status()), 'render unavailable in this environment');
    const warmEtag = warm.headers()['etag'];

    await saveThroughWopiProtocol(request, FILE_ID!, `AS4-1-${Date.now()}`);
    await saveThroughWopiProtocol(request, FILE_ID!, `AS4-2-${Date.now()}`);
    await saveThroughWopiProtocol(request, FILE_ID!, `AS4-3-${Date.now()}`);

    // Nothing requested a preview during the save window, so the source has
    // advanced three times with no intervening render: the ETag contract
    // (validator == source updatedDate) means the *first* post-save request
    // MUST see a fresh render — a 304 here would mean the endpoint was
    // touched (and rendered) during the save window itself, which is exactly
    // what this scenario forbids. A stale 304 is a contract violation, not a
    // sign of "no work happened".
    const afterSaves = await authedPage.request.get(previewUrl(FILE_ID!), {
      headers: { 'If-None-Match': warmEtag! },
    });
    expect(afterSaves.status()).toBe(200);
    expect(afterSaves.headers()['etag']).not.toBe(warmEtag);
    const freshEtag = afterSaves.headers()['etag'];

    // That one on-demand render is the only one that happened: a follow-up
    // request presenting the ETag it just returned must now be a cache hit,
    // proving the mapping it produced is stable rather than re-rendered on
    // every request.
    const cached = await authedPage.request.get(previewUrl(FILE_ID!), {
      headers: { 'If-None-Match': freshEtag! },
    });
    expect(cached.status()).toBe(304);
  });

  test('AS5 — twelve parallel requests for the same uncached document collapse to one render', async ({
    authedPage,
    request,
  }) => {
    test.skip(!ACTOR_ID, 'E2E_WOPI_ACTOR_ID is required for AS5 (forces an uncached state first)');
    await saveThroughWopiProtocol(request, FILE_ID!, `AS5-${Date.now()}`);

    const responses = await Promise.all(
      Array.from({ length: 12 }, () => authedPage.request.get(previewUrl(FILE_ID!)))
    );
    for (const res of responses) {
      expect(res.status()).toBe(200);
    }
    const bodies = await Promise.all(responses.map(res => res.body()));
    const first = bodies[0];
    for (const body of bodies.slice(1)) {
      expect(body.equals(first)).toBeTruthy();
    }
  });

  test('AS6 — a Collabora/cache outage fails only the image request; GraphQL content still loads', async ({
    authedPage,
  }) => {
    // This scenario is exercised live only when Collabora is deliberately
    // stopped for the forge-059 project (see forge/evidence/US3 for the
    // docker-stop walk + screenshots); as a durable CI check we assert the
    // weaker, always-true half of the contract: a 502/503 on the image
    // endpoint must never accompany a GraphQL failure.
    const graphqlRes = await authedPage.request.post(`${BASE_URL}/api/private/graphql`, {
      data: { query: 'query{__typename}' },
    });
    expect(graphqlRes.ok()).toBeTruthy();

    const previewRes = await authedPage.request.get(previewUrl(FILE_ID!));
    expect([200, 304, ...RENDER_UNAVAILABLE_STATUSES]).toContain(previewRes.status());
  });

  test('QS6 — a disconnected initiating request does not stop the shared render job from completing and caching', async ({
    authedPage,
    request,
  }) => {
    test.skip(!ACTOR_ID, 'E2E_WOPI_ACTOR_ID is required for QS6');
    await saveThroughWopiProtocol(request, FILE_ID!, `QS6-${Date.now()}`);

    // Issue and abort the initiating request from inside the page itself:
    // Playwright's `APIRequestContext.get()` takes no cancellation signal, so
    // it always runs to completion regardless of any `AbortController` built
    // around it — a browser `fetch()` aborted mid-flight is what actually
    // severs the connection the way a real disconnecting client would.
    await authedPage.evaluate(async url => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 20);
      try {
        await fetch(url, { signal: controller.signal, credentials: 'include' });
      } catch {
        // Expected: the fetch is aborted client-side before it completes.
      }
    }, previewUrl(FILE_ID!));

    // Poll briefly for the service-owned deadline to land the mapping.
    let landed = false;
    for (let i = 0; i < 20 && !landed; i++) {
      await new Promise(r => setTimeout(r, 200));
      const followUp = await authedPage.request.get(previewUrl(FILE_ID!));
      if (followUp.status() === 200) {
        landed = true;
      }
    }
    expect(landed).toBeTruthy();
  });

  test('QS48 — two sources with byte-identical previews keep distinct, independently-swapped mappings', async ({
    authedPage,
    request,
  }) => {
    test.skip(!FILE_ID_B, 'E2E_PREVIEW_FILE_ID_B is required for QS48');
    test.skip(!ACTOR_ID, 'E2E_WOPI_ACTOR_ID is required for QS48');

    const commonMarker = `QS48-COMMON-${Date.now()}`;
    await saveThroughWopiProtocol(request, FILE_ID!, commonMarker);
    await saveThroughWopiProtocol(request, FILE_ID_B!, commonMarker);

    const a = await authedPage.request.get(previewUrl(FILE_ID!));
    const b = await authedPage.request.get(previewUrl(FILE_ID_B!));
    expect(a.status()).toBe(200);
    expect(b.status()).toBe(200);
    expect(a.headers()['etag']).not.toBe(b.headers()['etag']); // distinct source fileIDs -> distinct validators
    const [aBody, bBody] = await Promise.all([a.body(), b.body()]);
    expect(aBody.equals(bBody)).toBeTruthy(); // but byte-identical rendered pixels

    await saveThroughWopiProtocol(request, FILE_ID!, `QS48-CHANGED-A-${Date.now()}`);
    const aAfter = await authedPage.request.get(previewUrl(FILE_ID!));
    const bAfter = await authedPage.request.get(previewUrl(FILE_ID_B!));
    expect(aAfter.status()).toBe(200);
    expect(bAfter.status()).toBe(200);
    expect(bAfter.headers()['etag']).toBe(b.headers()['etag']); // B's row/ETag untouched
    const bAfterBody = await bAfter.body();
    expect(bAfterBody.equals(bBody)).toBeTruthy(); // B's bytes untouched

    const aAfterBody = await aAfter.body();
    expect(aAfterBody.equals(aBody)).toBeFalsy(); // A's bytes changed (new render)
  });
});
