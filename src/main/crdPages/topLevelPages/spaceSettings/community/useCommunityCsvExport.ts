import {
  buildApplicationsCsv,
  buildCsvFilename,
  buildMembersCsv,
  buildOrganizationsCsv,
} from '@/core/utils/csv/csvExport';
import { downloadCsv } from '@/core/utils/csv/downloadCsv';
import type { CommunityMember, CommunityOrg } from '@/crd/components/space/settings/SpaceSettingsCommunityView';
import type { ApplicationModel } from '@/domain/access/model/ApplicationModel';

type UseCommunityCsvExportParams = {
  members: CommunityMember[];
  organizations: CommunityOrg[];
  applications: ApplicationModel[];
  spaceDisplayName: string | undefined;
  loading: boolean;
  errored: boolean;
};

type UseCommunityCsvExportResult = {
  exportMembers: () => void;
  exportApplications: () => void;
  exportOrganizations: () => void;
  exportDisabled: boolean;
};

export function useCommunityCsvExport({
  members,
  organizations,
  applications,
  spaceDisplayName,
  loading,
  errored,
}: UseCommunityCsvExportParams): UseCommunityCsvExportResult {
  const exportDisabled = loading || errored;

  const exportMembers = () => {
    const rows = members.map(m => ({
      displayName: m.displayName,
      email: m.email,
    }));
    const csv = buildMembersCsv(rows);
    const filename = buildCsvFilename(spaceDisplayName, 'members', new Date());
    downloadCsv(csv, filename);
  };

  const exportApplications = () => {
    const rows = applications.map(app => ({
      displayName: app.actor.profile?.displayName ?? '',
      email: app.user?.email,
      questions: (app.questions ?? []).map(q => ({ name: q.name, value: q.value })),
      createdDate: app.createdDate instanceof Date ? app.createdDate.toISOString() : String(app.createdDate ?? ''),
    }));
    const csv = buildApplicationsCsv(rows);
    const filename = buildCsvFilename(spaceDisplayName, 'applications', new Date());
    downloadCsv(csv, filename);
  };

  const exportOrganizations = () => {
    const rows = organizations.map(org => ({
      displayName: org.displayName,
      role: org.isLead ? ('lead' as const) : ('member' as const),
      url: org.url,
    }));
    const csv = buildOrganizationsCsv(rows);
    const filename = buildCsvFilename(spaceDisplayName, 'organizations', new Date());
    downloadCsv(csv, filename);
  };

  return {
    exportMembers,
    exportApplications,
    exportOrganizations,
    exportDisabled,
  };
}
