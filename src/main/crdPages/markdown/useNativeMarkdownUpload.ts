import { useTranslation } from 'react-i18next';
import { useRequestVisualUploadMutation } from '@/core/apollo/generated-v2/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useConfig } from '@/domain/platform/config/useConfig';

/** An inline image in markdown is referenced by the content itself (files.md:543, `file_ref(role='inline')`). */
const INLINE_ROLE = 'inline';

type UploadedFile = { id: string };

/**
 * The markdown editors of an existing entity: an inline image is uploaded through the file contract (022 FR-001/
 * FR-002; files.md:32, :166) — requestUpload on the owner with role `inline`, then PUT to the token's url — and is
 * inserted as its deterministic `/api/files/<id>` URL (files.md:707). The server references it when the markdown is
 * saved (reconcile_file_refs, files.md:543), so there is no attachFile. A refused or failed upload rejects with the
 * existing upload-error text, which the editor shows; it never falls back to a legacy upload.
 */
export const useNativeMarkdownUpload = (ownerId: string | undefined) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { integration: { iframeAllowedUrls = [] } = {} } = useConfig();
  const [requestUpload] = useRequestVisualUploadMutation();

  const fail = (): never => {
    throw new Error(t('components.file-upload.file-upload-error'));
  };

  const onImageUpload = async (file: File): Promise<string> => {
    if (!ownerId) return fail();
    const { data } = await requestUpload({
      variables: { owner: ownerId, mime: file.type, size: file.size, role: INLINE_ROLE },
    }).catch(fail);
    if (!data) return fail();
    const response = await fetch(data.requestUpload.url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${data.requestUpload.token}`,
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      },
      body: file,
    }).catch(fail);
    if (!response.ok) return fail();
    const uploaded = (await response.json()) as UploadedFile;
    return `/api/files/${uploaded.id}`;
  };

  const onError = (message: string) => notify(message, 'error');

  return { onImageUpload, iframeAllowedUrls, onError };
};
