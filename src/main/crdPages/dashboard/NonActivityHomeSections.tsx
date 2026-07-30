import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CollapsibleSpaceSection } from '@/crd/components/dashboard/CollapsibleSpaceSection';
import type { CompactSpaceCardData } from '@/crd/components/dashboard/CompactSpaceCard';
import { MyMembershipsPanel } from '@/crd/components/dashboard/MyMemberships/MyMembershipsPanel';
import type { MembershipItem, MembershipRole } from '@/crd/components/dashboard/MyMemberships/types';
import { URL_SPACE_EXPLORER } from '@/main/routing/urlBuilders';

const SECTION_ITEM_CAP = 4;
const LEAD_ADMIN_ROLES: MembershipRole[] = ['admin', 'lead'];

type NonActivityHomeSectionsProps = {
  /** Section 1 — pinned home Space + Spaces I was last active in (30d). */
  pinnedLastActive: CompactSpaceCardData[];
  /** Section 2 — most active Spaces platform-wide. */
  mostActivity: CompactSpaceCardData[];
  /** Section 3 — Spaces I lead or administer. */
  leadAdmin: CompactSpaceCardData[];
  /** Section 4 — Spaces on my account (hosted). */
  host: CompactSpaceCardData[];
  /** All my memberships, for the Section 3 "show more" panel (filtered to Lead/Admin). */
  membershipsItems: MembershipItem[];
  /** My hosted Spaces as panel items, for the Section 4 "show more" panel. */
  hostedPanelItems: MembershipItem[];
  pinnedLoading?: boolean;
  membershipsLoading?: boolean;
  hostedLoading?: boolean;
  homeSpaceId?: string;
  membershipSettingsUrl?: string;
  onNavigate: (href: string) => void;
};

/**
 * The non-activity home view (spec 024): four collapsible Space sections shown when the
 * member has Spaces and the Activity view is off. Owns its own "show more" panel state;
 * receives already-mapped section data from the dashboard controller.
 */
export function NonActivityHomeSections({
  pinnedLastActive,
  mostActivity,
  leadAdmin,
  host,
  membershipsItems,
  hostedPanelItems,
  pinnedLoading,
  membershipsLoading,
  hostedLoading,
  homeSpaceId,
  membershipSettingsUrl,
  onNavigate,
}: NonActivityHomeSectionsProps) {
  const { t } = useTranslation('crd-dashboard');
  const [openPanel, setOpenPanel] = useState<'lead-admin' | 'host' | null>(null);

  return (
    <>
      <div className="space-y-8">
        {/* Section 1 always renders (empty pin slot when no home Space). */}
        <CollapsibleSpaceSection
          title={t('nonActivity.sections.pinnedLastActive')}
          items={pinnedLastActive}
          maxVisible={SECTION_ITEM_CAP}
          loading={pinnedLoading}
          emptyPinSlot={!homeSpaceId && membershipSettingsUrl ? { settingsHref: membershipSettingsUrl } : undefined}
          onPinClick={() => membershipSettingsUrl && onNavigate(membershipSettingsUrl)}
        />

        {mostActivity.length > 0 && (
          <CollapsibleSpaceSection
            title={t('nonActivity.sections.mostActivity')}
            items={mostActivity}
            maxVisible={SECTION_ITEM_CAP}
          />
        )}

        {leadAdmin.length > 0 && (
          <CollapsibleSpaceSection
            title={t('nonActivity.sections.leadAdmin')}
            items={leadAdmin}
            maxVisible={SECTION_ITEM_CAP}
            showMore={{ onShowMore: () => setOpenPanel('lead-admin') }}
          />
        )}

        {host.length > 0 && (
          <CollapsibleSpaceSection
            title={t('nonActivity.sections.host')}
            items={host}
            maxVisible={SECTION_ITEM_CAP}
            showMore={{ onShowMore: () => setOpenPanel('host') }}
          />
        )}
      </div>

      {/* Section 3 "show more" — memberships scoped to Lead / Admin. */}
      <MyMembershipsPanel
        open={openPanel === 'lead-admin'}
        onClose={() => setOpenPanel(null)}
        items={membershipsItems}
        loading={membershipsLoading}
        title={t('nonActivity.sections.leadAdmin')}
        restrictToRoles={LEAD_ADMIN_ROLES}
        onNavigate={href => {
          setOpenPanel(null);
          onNavigate(href);
        }}
        browseAllHref={URL_SPACE_EXPLORER}
      />

      {/* Section 4 "show more" — the member's hosted account Spaces. */}
      <MyMembershipsPanel
        open={openPanel === 'host'}
        onClose={() => setOpenPanel(null)}
        items={hostedPanelItems}
        loading={hostedLoading}
        title={t('nonActivity.sections.host')}
        onNavigate={href => {
          setOpenPanel(null);
          onNavigate(href);
        }}
        browseAllHref={URL_SPACE_EXPLORER}
      />
    </>
  );
}
