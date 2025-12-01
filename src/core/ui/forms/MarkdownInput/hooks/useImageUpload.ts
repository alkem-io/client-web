import { useCallback } from 'react';
import { EditorView } from '@tiptap/pm/view';
import { useUploadFileMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '../../../notifications/useNotification';
import { useTranslation } from 'react-i18next';
import { Editor } from '@tiptap/react';

interface UseImageUploadProps {
  storageBucketId?: string;
  hideImageOptions?: boolean;
  temporaryLocation?: boolean;
  getEditor?: () => Editor | null;
}

export const useImageUpload = ({
  storageBucketId,
  hideImageOptions,
  temporaryLocation = false,
  getEditor,
}: UseImageUploadProps) => {
  const { t } = useTranslation();
  const notify = useNotification();

  const [uploadFile] = useUploadFileMutation({
    onCompleted: data => {
      notify(t('components.file-upload.file-upload-success'), 'success');
      const editor = getEditor?.();
      editor?.commands.setImage({ src: data.uploadFileOnStorageBucket.url, alt: 'pasted-image' });
    },
    onError: error => {
      console.error('File upload failed:', error.message);
      notify(t('components.file-upload.file-upload-error'), 'error');
    },
  });

  const isImageOrHtmlWithImage = useCallback((item: DataTransferItem, clipboardData: DataTransfer | null) => {
    if (item.type.startsWith('image/') || (item.kind === 'file' && item.type.startsWith('image/'))) {
      return true;
    }

    if (item.kind === 'string' && item.type === 'text/html') {
      const htmlContent = clipboardData?.getData('text/html');
      return htmlContent?.includes('<img') ?? false;
    }

    return false;
  }, []);

  const handlePaste = useCallback(
    (_view: EditorView, event: ClipboardEvent): boolean => {
      if (!storageBucketId) {
        return false;
      }

      const clipboardData = event.clipboardData;
      const items = clipboardData?.items;

      if (!items) {
        return false;
      }

      const itemsArray = Array.from(items);

      // Use for...of loop to enable proper early returns
      for (const item of itemsArray) {
        const isImage = isImageOrHtmlWithImage(item, clipboardData);

        if (hideImageOptions && isImage) {
          event.preventDefault();
          return true; // Block paste of images or HTML with images
        }

        if (isImage) {
          const file = item.getAsFile();

          if (file) {
            const reader = new FileReader();

            reader.onload = () => {
              uploadFile({ variables: { file, uploadData: { storageBucketId, temporaryLocation } } });
            };

            reader.readAsDataURL(file);
            event.preventDefault();
            return true; // Block default behavior for images
          }
        }
      }

      return false; // Allow default behavior for text
    },
    [storageBucketId, hideImageOptions, temporaryLocation, uploadFile, isImageOrHtmlWithImage]
  );

  return { handlePaste };
};
