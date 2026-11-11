import { useUsersContactabilityQuery } from '@/core/apollo/generated/apollo-hooks';
import type { ContributorPreviewData } from '@/crd/components/contributor/ContributorHoverCard';

/**
 * Keeps the card's Message action only for users who accept direct messages, so a click
 * never ends in "This person cannot be contacted". One query per list, never on hover.
 * Until the answer arrives nobody gets the action: an icon that later fails is worse than
 * one that appears a moment late.
 */
export function useContactableUsers(previews: (ContributorPreviewData | undefined)[], skip: boolean) {
  const ids = [...new Set(previews.filter(preview => preview?.canMessage).map(preview => preview!.id))].sort();
  const { data } = useUsersContactabilityQuery({ variables: { ids }, skip: skip || ids.length === 0 });
  const contactable = new Set(data?.users.filter(user => user.isContactable).map(user => user.id));

  return <T extends ContributorPreviewData | undefined>(preview: T): T =>
    preview?.canMessage && !contactable.has(preview.id) ? { ...preview, canMessage: false } : preview;
}
