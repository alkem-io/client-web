import { Check, Presentation, StickyNote, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';

/**
 * Tags Showcase — displays every tag/badge/chip/pill variant used across the
 * CRD design system so we can compare and decide which to keep.
 */
export function TagsShowcasePage() {
  const [interactiveTags, setInteractiveTags] = useState<string[]>(['sustainability', 'energy']);

  const allInteractiveTags = ['sustainability', 'energy', 'urban-planning', 'community', 'innovation', 'policy'];

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 space-y-12">
      <div>
        <h1 className="text-page-title text-foreground mb-2">Tags & Badges Inventory</h1>
        <p className="text-body text-muted-foreground">
          Every tag/badge/chip/pill variant currently in the CRD design system. Use this to decide which to keep and
          standardize.
        </p>
      </div>

      {/* 1. Badge primitive variants */}
      <section className="space-y-4">
        <div>
          <h2 className="text-subsection-title text-foreground">1. Badge Primitive (base component)</h2>
          <p className="text-caption text-muted-foreground mt-1">
            <code>src/crd/primitives/badge.tsx</code> — rounded-md, small. Used for counts, labels, type indicators.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="space-y-1 text-center">
            <Badge variant="default">Default</Badge>
            <p className="text-badge text-muted-foreground">default</p>
          </div>
          <div className="space-y-1 text-center">
            <Badge variant="secondary">Secondary</Badge>
            <p className="text-badge text-muted-foreground">secondary</p>
          </div>
          <div className="space-y-1 text-center">
            <Badge variant="destructive">Destructive</Badge>
            <p className="text-badge text-muted-foreground">destructive</p>
          </div>
          <div className="space-y-1 text-center">
            <Badge variant="outline">Outline</Badge>
            <p className="text-badge text-muted-foreground">outline</p>
          </div>
        </div>
        <p className="text-caption text-muted-foreground italic">
          Used by: PostCard (type label), EventCardHeader (type), DashboardSidebar (count), template components, and 29+
          other components.
        </p>
      </section>

      {/* 2. Badge + rounded-full (pill counters) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-subsection-title text-foreground">2. Badge as Rounded Pill (counters)</h2>
          <p className="text-caption text-muted-foreground mt-1">
            Badge primitive + <code>rounded-full</code> override. Small numeric indicators.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="space-y-1 text-center">
            <Badge className="text-badge px-1.5 h-[18px] bg-primary text-primary-foreground rounded-full">3</Badge>
            <p className="text-badge text-muted-foreground">Unread count</p>
          </div>
          <div className="space-y-1 text-center">
            <Badge variant="secondary" className="ml-auto text-badge px-1.5 py-0 rounded-full">
              12
            </Badge>
            <p className="text-badge text-muted-foreground">Sidebar count</p>
          </div>
          <div className="space-y-1 text-center">
            <Badge variant="secondary" className="rounded-full text-badge px-1.5">
              5
            </Badge>
            <p className="text-badge text-muted-foreground">Table count</p>
          </div>
        </div>
        <p className="text-caption text-muted-foreground italic">
          Used by: UserMenu (pending invitations), SpaceExplorer (search count), DashboardSidebar, PendingMembershipsTable.
        </p>
      </section>

      {/* 3. Post type badges */}
      <section className="space-y-4">
        <div>
          <h2 className="text-subsection-title text-foreground">3. Post Type Labels</h2>
          <p className="text-caption text-muted-foreground mt-1">
            Small informational badges on PostCard indicating content type and status.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="space-y-1 text-center">
            <Badge variant="secondary" className="text-badge h-5 px-1.5 font-normal">
              Post
            </Badge>
            <p className="text-badge text-muted-foreground">Type label</p>
          </div>
          <div className="space-y-1 text-center">
            <Badge variant="secondary" className="text-badge h-5 px-1.5 font-normal">
              Whiteboard
            </Badge>
            <p className="text-badge text-muted-foreground">Type label</p>
          </div>
          <div className="space-y-1 text-center">
            <Badge variant="secondary" className="text-badge h-5 px-1.5 font-normal">
              Memo
            </Badge>
            <p className="text-badge text-muted-foreground">Type label</p>
          </div>
          <div className="space-y-1 text-center">
            <Badge variant="outline" className="text-badge h-5 px-1.5 font-normal text-amber-600 border-amber-300">
              Draft
            </Badge>
            <p className="text-badge text-muted-foreground">Draft indicator</p>
          </div>
        </div>
        <p className="text-caption text-muted-foreground italic">Used by: PostCard.</p>
      </section>

      {/* 4. Keyword/Topic Tags (CollapsibleTagList display mode) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-subsection-title text-foreground">4. Keyword Tags (display mode)</h2>
          <p className="text-caption text-muted-foreground mt-1">
            <code>CollapsibleTagList</code> — rounded-full pills for topic/keyword display.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {['sustainability', 'renewable-energy', 'urban-planning', 'community-solar'].map(tag => (
            <span
              key={tag}
              className="inline-flex items-center justify-center rounded-full border border-transparent bg-secondary text-secondary-foreground px-2 py-0 text-badge font-medium"
            >
              {tag}
            </span>
          ))}
          <span className="inline-flex items-center justify-center rounded-full border border-transparent bg-secondary text-muted-foreground px-2 py-0 text-badge font-medium">
            +3
          </span>
        </div>
        <p className="text-caption text-muted-foreground italic">
          Used by: ReferencesAndTagsStrip (on PostCard), SpaceSubspacesList (subspace tags).
        </p>
      </section>

      {/* 5. Keyword Tags (interactive/toggle mode) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-subsection-title text-foreground">5. Keyword Tags (interactive toggle mode)</h2>
          <p className="text-caption text-muted-foreground mt-1">
            <code>CollapsibleTagList</code> interactive mode — toggleable keyword pills.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {allInteractiveTags.map(tag => {
            const active = interactiveTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  setInteractiveTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]))
                }
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-caption font-medium border transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border bg-background text-foreground hover:bg-muted'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
        <p className="text-caption text-muted-foreground italic">
          Used by: CollapsibleTagList (when interactive=true, e.g. space tag filters).
        </p>
      </section>

      {/* 6. Form input tags (TagsInput) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-subsection-title text-foreground">6. Form Input Tags (TagsInput)</h2>
          <p className="text-caption text-muted-foreground mt-1">
            <code>src/crd/forms/tags-input.tsx</code> — editable tags inside an input field.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center p-2 border border-border rounded-lg bg-background">
          {['sustainability', 'energy'].map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-caption font-medium border border-primary text-primary bg-primary/10"
            >
              {tag}
              <X className="w-3 h-3 cursor-pointer" />
            </span>
          ))}
          <span className="text-caption text-muted-foreground">Type to add...</span>
        </div>
        <p className="text-caption text-muted-foreground italic">
          Used by: SpaceExplorer (keyword search input).
        </p>
      </section>

      {/* 7. Search tags (SearchTagInput) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-subsection-title text-foreground">7. Search Tags (SearchTagInput)</h2>
          <p className="text-caption text-muted-foreground mt-1">
            <code>src/crd/components/search/SearchTagInput.tsx</code> — active search pills.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {['renewable', 'solar'].map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-control font-medium bg-primary text-primary-foreground"
            >
              {tag}
              <X className="w-3 h-3 cursor-pointer" />
            </span>
          ))}
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-control font-medium border border-primary bg-primary text-primary-foreground">
            Scope: Spaces
          </span>
        </div>
        <p className="text-caption text-muted-foreground italic">
          Used by: Search overlay/dialog.
        </p>
      </section>

      {/* 8. Chip strips (radio-style selectors) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-subsection-title text-foreground">8. Chip Strips (radio selectors)</h2>
          <p className="text-caption text-muted-foreground mt-1">
            <code>FramingChipStrip</code> / <code>ResponseTypeChipStrip</code> — single-select chips.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {[
            { label: 'Whiteboard', active: false },
            { label: 'Memo', active: true },
            { label: 'Document', active: false },
            { label: 'Call to Action', active: false },
          ].map(chip => (
            <span
              key={chip.label}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-control font-medium ${
                chip.active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-muted-foreground'
              }`}
            >
              <StickyNote className="w-4 h-4" />
              {chip.label}
            </span>
          ))}
        </div>
        <p className="text-caption text-muted-foreground italic">
          Used by: AddPostModal (framing + response type selection).
        </p>
      </section>

      {/* 9. Person/avatar pills */}
      <section className="space-y-4">
        <div>
          <h2 className="text-subsection-title text-foreground">9. Person Pills (UserSelector)</h2>
          <p className="text-caption text-muted-foreground mt-1">
            <code>UserSelector</code> / <code>ContributorSelector</code> — avatar + name + remove.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {['Sarah Chen', 'David Kim'].map(name => (
            <span
              key={name}
              className="inline-flex items-center gap-2 pr-1 pl-1 py-1 rounded-full border border-border bg-background"
            >
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-badge">
                {name.charAt(0)}
              </span>
              <span className="text-caption pr-1">{name}</span>
              <button type="button" className="rounded-full p-0.5 hover:bg-accent">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <p className="text-caption text-muted-foreground italic">
          Used by: UserSelector, ContributorSelector (member/lead assignment forms).
        </p>
      </section>

      {/* 10. Status pills */}
      <section className="space-y-4">
        <div>
          <h2 className="text-subsection-title text-foreground">10. Status Pills (OrgVerifiedBadge)</h2>
          <p className="text-caption text-muted-foreground mt-1">
            <code>OrgVerifiedBadge</code> — semantic colored status indicators.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-caption font-medium bg-emerald-500/10 text-emerald-600">
            <Check className="w-3 h-3" />
            Verified
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-caption font-medium bg-amber-500/10 text-amber-600">
            Pending
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-caption font-medium bg-muted text-muted-foreground">
            Not verified
          </span>
        </div>
        <p className="text-caption text-muted-foreground italic">
          Used by: Organization settings page (verification status).
        </p>
      </section>

      {/* 11. Filter toggle pills */}
      <section className="space-y-4">
        <div>
          <h2 className="text-subsection-title text-foreground">11. Filter Toggle Pills</h2>
          <p className="text-caption text-muted-foreground mt-1">
            Button-styled rounded pills used as toggle filters.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {[
            { label: 'All', active: true },
            { label: 'Active', active: false },
            { label: 'Archived', active: false },
          ].map(filter => (
            <button
              key={filter.label}
              type="button"
              className={`px-3 py-1.5 text-body-emphasis rounded-full border whitespace-nowrap transition-colors ${
                filter.active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <p className="text-caption text-muted-foreground italic">
          Used by: SpaceSubspacesList (status filter), NotificationsPanel (notification type filter).
        </p>
      </section>

      {/* 12. Notification filter chips */}
      <section className="space-y-4">
        <div>
          <h2 className="text-subsection-title text-foreground">12. Notification Filter Chips</h2>
          <p className="text-caption text-muted-foreground mt-1">
            <code>NotificationsPanel</code> — uses Button primitive with rounded-full.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {[
            { label: 'All', active: true },
            { label: 'Mentions', active: false },
            { label: 'Updates', active: false },
            { label: 'Invitations', active: false },
          ].map(filter => (
            <Button
              key={filter.label}
              variant={filter.active ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-caption rounded-full shrink-0"
            >
              {filter.label}
            </Button>
          ))}
        </div>
        <p className="text-caption text-muted-foreground italic">Used by: NotificationsPanel (filter bar).</p>
      </section>

      {/* 13. "Beta" label badge */}
      <section className="space-y-4">
        <div>
          <h2 className="text-subsection-title text-foreground">13. "Beta" Label Badge</h2>
          <p className="text-caption text-muted-foreground mt-1">
            Tiny badge overlaid on the user avatar in the header.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative inline-block">
            <span className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-caption">AR</span>
            <Badge variant="secondary" className="absolute -bottom-1 -right-1 px-1 py-0 h-4 border border-border text-badge">
              Beta
            </Badge>
          </div>
        </div>
        <p className="text-caption text-muted-foreground italic">Used by: UserMenu (avatar badge).</p>
      </section>
    </div>
  );
}
