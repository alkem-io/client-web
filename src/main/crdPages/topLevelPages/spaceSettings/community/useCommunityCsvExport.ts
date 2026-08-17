import { buildApplicationsCsv, buildCsvFilename, buildMembersCsv } from '@/core/utils/csv/csvExport';
import { downloadCsv } from '@/core/utils/csv/downloadCsv';
import type { CommunityMember } from '@/crd/components/space/settings/SpaceSettingsCommunityView';
import type { ApplicationModel } from '@/domain/access/model/ApplicationModel';

type UseCommunityCsvExportParams = {
  members: CommunityMember[];
  applications: ApplicationModel[];
  spaceDisplayName: string | undefined;
  loading: boolean;
};

type UseCommunityCsvExportResult = {
  exportMembers: () => void;
  exportApplications: () => void;
  exportDisabled: boolean;
};

export function useCommunityCsvExport({
  members,
  applications,
  spaceDisplayName,
  loading,
}: UseCommunityCsvExportParams): UseCommunityCsvExportResult {
  const exportDisabled = loading;

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
      email: app.user?.email ?? app.actor.profile?.email,
      questions: (app.questions ?? []).map(q => ({ name: q.name, value: q.value })),
      createdDate: app.createdDate instanceof Date ? app.createdDate.toISOString() : String(app.createdDate ?? ''),
    }));
    const csv = buildApplicationsCsv(rows);
    const filename = buildCsvFilename(spaceDisplayName, 'applications', new Date());
    downloadCsv(csv, filename);
  };

  return {
    exportMembers,
    exportApplications,
    exportDisabled,
  };
}
