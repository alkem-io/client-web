import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import type { CommunityMember } from '@/crd/components/space/settings/SpaceSettingsCommunityView';
import type { ApplicationModel } from '@/domain/access/model/ApplicationModel';
import { useCommunityCsvExport } from './useCommunityCsvExport';

vi.mock('@/core/utils/csv/csvExport', () => ({
  buildMembersCsv: vi.fn(() => 'members-csv'),
  buildApplicationsCsv: vi.fn(() => 'applications-csv'),
  buildCsvFilename: vi.fn((name: string, kind: string) => `${name ?? 'space'}-${kind}.csv`),
  normalizeEmailCell: vi.fn((v: string) => v),
  toCsv: vi.fn(),
}));

vi.mock('@/core/utils/csv/downloadCsv', () => ({
  downloadCsv: vi.fn(),
}));

import { buildApplicationsCsv, buildCsvFilename, buildMembersCsv } from '@/core/utils/csv/csvExport';
import { downloadCsv } from '@/core/utils/csv/downloadCsv';

const makeMember = (overrides?: Partial<CommunityMember>): CommunityMember => ({
  id: 'u1',
  displayName: 'Alice',
  email: 'alice@example.com',
  roleLabel: 'Member',
  isLead: false,
  isAdmin: false,
  joinedDate: '',
  ...overrides,
});

const makeApplication = (overrides?: Partial<ApplicationModel>): ApplicationModel => ({
  id: 'app1',
  createdDate: new Date('2026-01-01T00:00:00.000Z'),
  updatedDate: new Date('2026-01-01T00:00:00.000Z'),
  state: 'new',
  nextEvents: [],
  contributorType: ActorType.User,
  actor: {
    id: 'actor1',
    profile: {
      displayName: 'Bob',
      email: 'bob@example.com',
      url: 'https://example.com/bob',
    },
  },
  questions: [{ id: 'q1', name: 'Why join?', value: 'Because!' }],
  user: { id: 'u2', email: 'bob@example.com' },
  ...overrides,
});

describe('useCommunityCsvExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exportDisabled follows loading', () => {
    const result = useCommunityCsvExport({
      members: [],
      applications: [],
      spaceDisplayName: 'My Space',
      loading: true,
    });
    expect(result.exportDisabled).toBe(true);

    const result2 = useCommunityCsvExport({
      members: [],
      applications: [],
      spaceDisplayName: 'My Space',
      loading: false,
    });
    expect(result2.exportDisabled).toBe(false);
  });

  it('members mapping: displayName and email passed through', () => {
    const members = [makeMember({ displayName: 'Alice', email: 'alice@example.com' })];
    const result = useCommunityCsvExport({
      members,
      applications: [],
      spaceDisplayName: 'My Space',
      loading: false,
    });

    result.exportMembers();

    expect(buildMembersCsv).toHaveBeenCalledWith([{ displayName: 'Alice', email: 'alice@example.com' }]);
    expect(downloadCsv).toHaveBeenCalled();
  });

  it('exportApplications: all applications included, questions mapped', () => {
    const applications = [makeApplication()];
    const result = useCommunityCsvExport({
      members: [],
      applications,
      spaceDisplayName: 'Test Space',
      loading: false,
    });

    result.exportApplications();

    expect(buildApplicationsCsv).toHaveBeenCalledWith([
      expect.objectContaining({
        displayName: 'Bob',
        email: 'bob@example.com',
        questions: [{ name: 'Why join?', value: 'Because!' }],
      }),
    ]);
    expect(downloadCsv).toHaveBeenCalled();
  });

  it('exportApplications: missing user → falls back to actor profile email', () => {
    const app = makeApplication({ user: undefined });
    const result = useCommunityCsvExport({
      members: [],
      applications: [app],
      spaceDisplayName: 'Test Space',
      loading: false,
    });

    result.exportApplications();

    expect(buildApplicationsCsv).toHaveBeenCalledWith([
      expect.objectContaining({
        email: 'bob@example.com', // falls back to actor.profile.email
      }),
    ]);
  });

  it('exportApplications: missing user and missing actor email → undefined', () => {
    const app = makeApplication({
      user: undefined,
      actor: {
        id: 'actor1',
        profile: {
          displayName: 'Charlie',
          url: 'https://example.com/charlie',
        },
      },
    });
    const result = useCommunityCsvExport({
      members: [],
      applications: [app],
      spaceDisplayName: 'Test Space',
      loading: false,
    });

    result.exportApplications();

    expect(buildApplicationsCsv).toHaveBeenCalledWith([
      expect.objectContaining({
        email: undefined,
      }),
    ]);
  });

  it('buildCsvFilename is called with spaceDisplayName and correct kind', () => {
    const members = [makeMember()];
    const result = useCommunityCsvExport({
      members,
      applications: [],
      spaceDisplayName: 'My Space',
      loading: false,
    });

    result.exportMembers();

    expect(buildCsvFilename).toHaveBeenCalledWith('My Space', 'members', expect.any(Date));
  });
});
