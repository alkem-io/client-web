import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import type { Identifiable } from '@/core/utils/Identifiable';
import { WhiteboardCollabSettings } from '@/crd/components/whiteboard/WhiteboardCollabSettings';
import useContentUpdatePolicyManager from '@/domain/collaboration/realTimeCollaboration/CollaborationSettings/useContentUpdatePolicyManager';

type CrdCollaborationSettingsProps = {
  element:
    | (Identifiable & {
        createdBy?: {
          profile?: {
            displayName: string;
            url?: string;
            avatar?: { uri: string };
          };
        };
      })
    | undefined;
  elementType: 'whiteboard' | 'memo';
  guestAccessEnabled?: boolean;
};

const OPTIONS_ORDER = [ContentUpdatePolicy.Contributors, ContentUpdatePolicy.Admins, ContentUpdatePolicy.Owner];

/**
 * CRD replacement for the MUI `CollaborationSettings`. Wires the existing
 * `useContentUpdatePolicyManager` hook (whiteboard / memo content-update policy mutations)
 * to the presentational `WhiteboardCollabSettings` block. Reuses the existing
 * `components.shareSettings.*` translation keys to avoid duplicating copy into the
 * CRD namespace.
 */
export function CrdCollaborationSettings({ element, elementType, guestAccessEnabled }: CrdCollaborationSettingsProps) {
  const { t } = useTranslation();
  const { contentUpdatePolicy, loading, updating, onChange } = useContentUpdatePolicyManager({
    elementId: element?.id,
    elementType,
    skip: !element?.id || !elementType,
  });

  const [selected, setSelected] = useState<ContentUpdatePolicy | undefined>(contentUpdatePolicy);

  useEffect(() => {
    if (!updating) setSelected(contentUpdatePolicy);
  }, [contentUpdatePolicy, updating]);

  const handleChange = (next: string) => {
    const value = next as ContentUpdatePolicy;
    setSelected(value);
    void onChange?.(value);
  };

  const elementName = t(`common.${elementType}`);
  const owner = element?.createdBy?.profile
    ? {
        displayName: element.createdBy.profile.displayName,
        avatarUrl: element.createdBy.profile.avatar?.uri,
        url: element.createdBy.profile.url,
      }
    : undefined;

  const options = OPTIONS_ORDER.map(option => ({
    value: option,
    label: t(`components.shareSettings.editableBy.options.${option}` as const, { elementName }),
  }));

  return (
    <WhiteboardCollabSettings
      title={t('common.Settings')}
      description={t('components.shareSettings.description', { elementName })}
      ownedByLabel={t('components.shareSettings.ownedBy.title', { elementName })}
      owner={owner}
      editableByLabel={t('components.shareSettings.editableBy.title', { elementName })}
      options={options}
      value={selected}
      onChange={handleChange}
      disabled={loading || updating}
      warningMessage={guestAccessEnabled ? t('components.shareSettings.guestAccessWarning') : undefined}
    />
  );
}
