import { useCallback } from 'react';
import { useDeleteDocumentMutation } from '@/core/apollo/generated/apollo-hooks';

// Storage URLs have the format: /api/private/rest/storage/document/{UUID}
const STORAGE_DOCUMENT_PATH = '/api/private/rest/storage/document/';

/**
 * Extracts the document ID from a storage URL.
 * Storage URLs have the format: /api/private/rest/storage/document/{UUID}
 */
export const extractDocumentIdFromUri = (uri: string): string | undefined => {
  const pathIndex = uri.indexOf(STORAGE_DOCUMENT_PATH);
  if (pathIndex === -1) {
    return undefined;
  }
  const idStart = pathIndex + STORAGE_DOCUMENT_PATH.length;
  // UUID is 36 characters
  const documentId = uri.substring(idStart, idStart + 36);
  // Basic UUID validation
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
    return documentId;
  }
  return undefined;
};

/**
 * Hook that provides utilities for deleting uploaded documents.
 * Used to clean up temporary file uploads when users cancel or remove links.
 */
const useDeleteDocument = () => {
  const [deleteDocumentMutation] = useDeleteDocumentMutation();

  /**
   * Deletes a single document by extracting its ID from the storage URI.
   * Silently fails if the document doesn't exist or user lacks permission.
   */
  const deleteDocument = useCallback(
    async (uri: string) => {
      const documentId = extractDocumentIdFromUri(uri);
      if (documentId) {
        try {
          await deleteDocumentMutation({ variables: { documentId } });
        } catch {
          // Silently fail - document may already be deleted or user may not have permission
        }
      }
    },
    [deleteDocumentMutation]
  );

  /**
   * Deletes multiple documents from a list of URIs.
   * Only deletes URIs that are valid storage document URLs.
   */
  const deleteDocuments = useCallback(
    async (uris: string[]) => {
      const deletePromises = uris.filter(uri => uri && extractDocumentIdFromUri(uri)).map(uri => deleteDocument(uri));
      await Promise.all(deletePromises);
    },
    [deleteDocument]
  );

  return {
    deleteDocument,
    deleteDocuments,
    extractDocumentIdFromUri,
  };
};

export default useDeleteDocument;
