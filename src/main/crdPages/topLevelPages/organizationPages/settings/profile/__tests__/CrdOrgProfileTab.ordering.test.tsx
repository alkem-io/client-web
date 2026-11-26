import { act, fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReferenceRow } from '@/crd/forms/references/ReferencesEditor';
import type { TabUnsavedChanges } from '@/main/crdPages/utils/tabUnsavedChanges';

// Every render publishes the bar's state; record it beside the row the same render shows.
const renders: { canSave: boolean; uri: string }[] = [];
let shownRows: ReferenceRow[] = [];
let settleUpload: (url: string) => void = () => {};

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUploadFileMutation: () => [
    () =>
      new Promise(resolve => {
        settleUpload = url => resolve({ data: { uploadFileOnStorageBucket: { url } } });
      }),
  ],
}));
vi.mock('@/main/crdPages/markdown/MarkdownUploadScope', () => ({
  MarkdownUploadScope: ({ children }: { children: (upload: undefined) => React.ReactNode }) => children(undefined),
}));
vi.mock('@/domain/community/organization/hooks/useOrganizationContext', () => ({
  useOrganizationContext: () => ({ organizationId: 'org-1' }),
}));
vi.mock('@/domain/storage/StorageBucket/useStorageConfig', () => ({
  default: () => ({
    storageConfig: {
      storageBucketId: 'bucket-1',
      allowedMimeTypes: [],
      maxFileSize: 0,
      canUpload: true,
      temporaryLocation: false,
    },
  }),
}));
vi.mock('@/main/crdPages/utils/useCityOptions', () => ({
  useCityOptions: () => ({ options: [], onRequest: vi.fn() }),
}));
vi.mock('@/main/crdPages/topLevelPages/common/settingsUnsavedChanges', () => ({
  useSettingsTabUnsavedChanges: (next: TabUnsavedChanges) =>
    renders.push({ canSave: next.canSave, uri: shownRows[0]?.uri ?? '' }),
}));
vi.mock('../useOrgProfileTabData', async () => {
  const { useState } = await import('react');
  return {
    default: () => {
      const [references, setReferences] = useState<ReferenceRow[]>([{ id: 'r1', name: '', uri: '', description: '' }]);
      shownRows = references;
      return {
        values: { references },
        loading: false,
        pendingAvatarCrop: null,
        onReferencesChange: setReferences,
        unsaved: { count: 1, canSave: true, saving: false, error: null, saveAll: vi.fn(), reset: vi.fn() },
        resetGeneration: 0,
      };
    },
  };
});
vi.mock('@/crd/components/organization/settings/OrgProfileTabView', async () => {
  const { ReferencesEditor } = await import('@/crd/forms/references/ReferencesEditor');
  return {
    OrgProfileTabView: (props: {
      values: { references: ReferenceRow[] };
      onReferencesChange: (rows: ReferenceRow[]) => void;
      onReferenceFileUpload?: (file: File) => Promise<string | null>;
    }) => (
      <ReferencesEditor
        rows={props.values.references}
        onChange={props.onReferencesChange}
        onFileUpload={props.onReferenceFileUpload}
      />
    ),
  };
});
vi.mock('@/crd/components/common/ImageCropDialog', () => ({ ImageCropDialog: () => null }));

import CrdOrgProfileTab from '../CrdOrgProfileTab';

describe('CrdOrgProfileTab — Save comes back with the uploaded row', () => {
  it('never renders Save enabled while the uploaded row is still missing', async () => {
    render(<CrdOrgProfileTab />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [new File(['x'], 'report.pdf')] } });
    const picked = renders.length;
    expect(renders[picked - 1].canSave).toBe(false);

    await act(async () => settleUpload('https://cdn/report'));

    const after = renders.slice(picked);
    expect(after.filter(r => r.canSave).every(r => r.uri === 'https://cdn/report')).toBe(true);
    expect(after[after.length - 1]).toEqual({ canSave: true, uri: 'https://cdn/report' });
  });
});
