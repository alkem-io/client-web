import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TabUnsavedChanges } from '@/main/crdPages/utils/tabUnsavedChanges';

const published = vi.fn<(unsaved: TabUnsavedChanges) => void>();
const viewProps = vi.fn<(props: { referencesKey?: unknown }) => void>();
let uploading = false;
const unsaved: TabUnsavedChanges = {
  count: 1,
  canSave: true,
  saveBlockedReason: 'own reason',
  saving: false,
  error: null,
  saveAll: vi.fn(),
  reset: vi.fn(),
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, options?: { ns?: string }) => `${options?.ns ?? 'tab'}:${key}` }),
}));
vi.mock('@/main/crdPages/markdown/MarkdownUploadScope', () => ({
  MarkdownUploadScope: ({ children }: { children: (upload: undefined) => React.ReactNode }) => children(undefined),
}));
vi.mock('@/domain/community/organization/hooks/useOrganizationContext', () => ({
  useOrganizationContext: () => ({ organizationId: 'org-1' }),
}));
vi.mock('@/domain/storage/StorageBucket/useStorageConfig', () => ({ default: () => ({ storageConfig: undefined }) }));
vi.mock('@/main/crdPages/utils/useCityOptions', () => ({
  useCityOptions: () => ({ options: [], onRequest: vi.fn() }),
}));
vi.mock('@/main/crdPages/utils/useReferenceFileUpload', () => ({
  useReferenceFileUpload: () => ({ onFileUpload: vi.fn(), accept: undefined, canUpload: true, uploading }),
}));
vi.mock('@/main/crdPages/topLevelPages/common/settingsUnsavedChanges', () => ({
  useSettingsTabUnsavedChanges: (next: TabUnsavedChanges) => published(next),
}));
vi.mock('../useOrgProfileTabData', () => ({
  default: () => ({
    values: null,
    loading: false,
    pendingAvatarCrop: null,
    unsaved,
    resetGeneration: 7,
  }),
}));
vi.mock('@/crd/components/organization/settings/OrgProfileTabView', () => ({
  OrgProfileTabView: (props: { referencesKey?: unknown }) => {
    viewProps(props);
    return null;
  },
}));
vi.mock('@/crd/components/common/ImageCropDialog', () => ({ ImageCropDialog: () => null }));

import CrdOrgProfileTab from '../CrdOrgProfileTab';

beforeEach(() => {
  published.mockClear();
  viewProps.mockClear();
});

describe('CrdOrgProfileTab — no Save while files upload', () => {
  it('withholds Save with the blocked reason while an upload runs', () => {
    uploading = true;
    render(<CrdOrgProfileTab />);

    const last = published.mock.calls[published.mock.calls.length - 1][0];
    expect(last.canSave).toBe(false);
    expect(last.saveBlockedReason).toBe('crd-common:fileSelection.saveBlocked');
  });

  it("passes the data hook's own values when no upload runs", () => {
    uploading = false;
    render(<CrdOrgProfileTab />);

    const last = published.mock.calls[published.mock.calls.length - 1][0];
    expect(last.canSave).toBe(true);
    expect(last.saveBlockedReason).toBe('own reason');
  });

  it("keys the references editor on the data hook's resetGeneration", () => {
    render(<CrdOrgProfileTab />);
    expect(viewProps.mock.calls[viewProps.mock.calls.length - 1][0].referencesKey).toBe(7);
  });
});
