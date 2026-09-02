import type { ReactNode } from 'react';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import type { StorageConfigOptions } from '@/domain/storage/StorageBucket/useStorageConfig';
import { useMarkdownEditorIntegration } from './useMarkdownEditorIntegration';

type MarkdownUploadScopeProps = {
  /**
   * Storage bucket the markdown editor uploads into. Pass `undefined` until the
   * owning entity id has resolved — the scope then renders the children with no
   * upload wiring (no provider mounted, the editor just hides the affordance),
   * matching the pre-upload behaviour instead of throwing.
   */
  storage: StorageConfigOptions | undefined;
  /** `true` for create flows (entity has no bucket yet → temporary location). */
  temporaryLocation?: boolean;
  /** Receives the upload wiring when available, `undefined` otherwise. */
  children: (markdownUpload?: MarkdownUploadProps) => ReactNode;
};

/**
 * Mounts an entity-scoped `StorageConfigContextProvider` and exposes the
 * `useMarkdownEditorIntegration` result to its children via a render prop.
 *
 * Settings routes (User / Organization / Virtual Contributor profile + VC
 * settings) have no ambient storage provider, so each markdown editor needs its
 * own. This collapses the otherwise-identical outer-guard / provider /
 * hook-wrapper boilerplate into one reusable seam (the upload hook must be
 * called *inside* the provider, hence the inner component). Lives in the
 * integration layer — it touches Apollo via the storage provider, so it must
 * not move into `src/crd/`.
 */
export function MarkdownUploadScope({ storage, temporaryLocation, children }: MarkdownUploadScopeProps) {
  if (!storage) {
    return <>{children()}</>;
  }
  return (
    <StorageConfigContextProvider {...storage}>
      <MarkdownUploadScopeInner temporaryLocation={temporaryLocation}>{children}</MarkdownUploadScopeInner>
    </StorageConfigContextProvider>
  );
}

function MarkdownUploadScopeInner({
  temporaryLocation,
  children,
}: {
  temporaryLocation?: boolean;
  children: (markdownUpload?: MarkdownUploadProps) => ReactNode;
}) {
  const markdownUpload = useMarkdownEditorIntegration({ temporaryLocation });
  return <>{children(markdownUpload)}</>;
}
