import { useDeleteDocumentMutation } from '@/core/apollo/generated/apollo-hooks';

/**
 * Hook that provides utilities for deleting uploaded documents by their IDs.
 * Used to clean up temporary file uploads when users cancel or remove links.
 */
const useDeleteDocument = () => {
  const [deleteDocumentMutation] = useDeleteDocumentMutation();

  /**
   * Deletes a single document by its ID.
   * Silently fails if the document doesn't exist or user lacks permission.
   */
  const deleteDocumentById = async (documentId: string) => {
    if (documentId) {
      try {
        await deleteDocumentMutation({ variables: { documentId } });
      } catch {
        // Silently fail - document may already be deleted or user may not have permission
      }
    }
  };

  /**
   * Deletes multiple documents by their IDs.
   */
  const deleteDocumentsById = async (documentIds: string[]) => {
    const deletePromises = documentIds.map(id => deleteDocumentById(id));
    await Promise.all(deletePromises);
  };

  return {
    deleteDocumentById,
    deleteDocumentsById,
  };
};

export default useDeleteDocument;
