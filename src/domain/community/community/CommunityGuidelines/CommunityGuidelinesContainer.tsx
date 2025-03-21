import {
  refetchCommunityGuidelinesQuery,
  useCommunityGuidelinesQuery,
  useCreateReferenceOnProfileMutation,
  useDeleteReferenceMutation,
  useRemoveCommunityGuidelinesContentMutation,
  useTemplateContentLazyQuery,
  useUpdateCommunityGuidelinesMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { useTranslation } from 'react-i18next';
import { compact } from 'lodash';
import { Identifiable } from '@/core/utils/Identifiable';
import useEnsurePresence from '@/core/utils/ensurePresence';

export interface CommunityGuidelines {
  displayName: string;
  description: string | undefined;
  references: {
    id: string;
    name: string;
    description?: string;
    uri: string;
  }[];
}

interface CommunityGuidelinesContainerProvided {
  communityGuidelines: CommunityGuidelines | undefined;
  communityGuidelinesId: string | undefined;
  profileId: string | undefined; // ProfileId is required to create references
  loading: boolean;
  onSelectCommunityGuidelinesTemplate: (template: Identifiable) => Promise<unknown>;
  onUpdateCommunityGuidelines: (values: CommunityGuidelines) => Promise<unknown>;
  onDeleteCommunityGuidelinesContent?: () => Promise<unknown>;
}

interface CommunityGuidelinesContainerProps extends SimpleContainerProps<CommunityGuidelinesContainerProvided> {
  communityGuidelinesId: string | undefined;
}

const CommunityGuidelinesContainer = ({ communityGuidelinesId, children }: CommunityGuidelinesContainerProps) => {
  const { t } = useTranslation();
  const ensurePresence = useEnsurePresence();
  const notify = useNotification();

  const { data, loading } = useCommunityGuidelinesQuery({
    variables: {
      communityGuidelinesId: communityGuidelinesId!,
    },
    skip: !communityGuidelinesId,
  });

  const profileId = data?.lookup.communityGuidelines?.profile.id;
  // This mapping is needed for the form
  const communityGuidelines = data?.lookup.communityGuidelines?.profile && {
    displayName: data.lookup.communityGuidelines.profile.displayName,
    description: data.lookup.communityGuidelines.profile.description,
    references: (data.lookup.communityGuidelines.profile.references ?? []).map(reference => ({
      id: reference.id,
      name: reference.name,
      description: reference.description,
      uri: reference.uri,
    })),
  };

  const [removeCommunityGuidelinesContent] = useRemoveCommunityGuidelinesContentMutation();
  const [updateGuidelines, { loading: submittingGuidelines }] = useUpdateCommunityGuidelinesMutation();

  const onUpdateCommunityGuidelines = async (values: CommunityGuidelines) => {
    const requiredCommunityGuidelinesId = ensurePresence(communityGuidelinesId);

    return updateGuidelines({
      variables: {
        communityGuidelinesData: {
          communityGuidelinesID: requiredCommunityGuidelinesId,
          profile: {
            displayName: values.displayName,
            description: values.description,
            references: values.references.map(reference => ({
              ID: reference.id,
              name: reference.name,
              description: reference.description,
              uri: reference.uri,
            })),
          },
        },
      },
      onCompleted: () => notify(t('community.communityGuidelines.updatedSuccessfully'), 'success'),
      awaitRefetchQueries: true,
      refetchQueries: [
        refetchCommunityGuidelinesQuery({
          communityGuidelinesId: requiredCommunityGuidelinesId,
        }),
      ],
    });
  };

  const onDeleteCommunityGuidelinesContent = async () => {
    const requiredCommunityGuidelinesId = ensurePresence(communityGuidelinesId);

    await removeCommunityGuidelinesContent({
      variables: {
        communityGuidelinesData: {
          communityGuidelinesID: requiredCommunityGuidelinesId,
        },
      },
      onCompleted: () => notify(t('community.communityGuidelines.saveAndDeleteContentSuccessMessage'), 'success'),
      awaitRefetchQueries: true,
      refetchQueries: [refetchCommunityGuidelinesQuery({ communityGuidelinesId: requiredCommunityGuidelinesId })],
    });
  };

  const [fetchCommunityGuidelinesTemplates] = useTemplateContentLazyQuery();
  const [removeReference, { loading: removingReference }] = useDeleteReferenceMutation();
  const [createReference, { loading: addingReference }] = useCreateReferenceOnProfileMutation();
  const onSelectCommunityGuidelinesTemplate = async ({ id: templateId }: Identifiable) => {
    const { data } = await fetchCommunityGuidelinesTemplates({
      variables: {
        templateId,
        includeCommunityGuidelines: true,
      },
    });
    const template = data?.lookup.template;
    const currentReferences = communityGuidelines?.references ?? [];
    const templateReferences = template?.communityGuidelines?.profile.references ?? [];
    const guidelines = template?.communityGuidelines;
    if (!guidelines || !profileId) {
      return;
    }

    // Remove all my current references
    if (currentReferences.length > 0) {
      await Promise.all(
        currentReferences.map(reference =>
          removeReference({
            variables: {
              input: {
                ID: reference.id,
              },
            },
          })
        )
      );
    }

    // Copy all the references from the template
    // TODO: This is just copying the link, maybe we should duplicate the content into the current StorageBucket
    if (templateReferences?.length > 0) {
      const createdReferences = await Promise.all(
        templateReferences.map(reference =>
          createReference({
            variables: {
              input: {
                profileID: profileId,
                name: reference.name,
                description: reference.description,
                uri: reference.uri,
              },
            },
          })
        )
      );
      const newReferences = compact(createdReferences.map(({ data }) => data?.createReferenceOnProfile));

      await onUpdateCommunityGuidelines({
        displayName: guidelines.profile.displayName,
        description: guidelines.profile.description,
        references: newReferences,
      });
    } else {
      await onUpdateCommunityGuidelines({
        displayName: guidelines.profile.displayName,
        description: guidelines.profile.description,
        references: [],
      });
    }
  };

  return (
    <>
      {children({
        communityGuidelines,
        communityGuidelinesId,
        profileId,
        loading: loading || submittingGuidelines || removingReference || addingReference,
        onUpdateCommunityGuidelines,
        onSelectCommunityGuidelinesTemplate,
        onDeleteCommunityGuidelinesContent,
      })}
    </>
  );
};

export default CommunityGuidelinesContainer;
