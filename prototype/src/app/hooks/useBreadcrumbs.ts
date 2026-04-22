import { useLocation, useParams } from "react-router";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import AlkemioSymbolSquare from "@/imports/AlkemioSymbolSquare";
import { INDIVIDUAL_TEMPLATES, TEMPLATE_PACKS, PACK_SPECIFIC_TEMPLATES } from "@/app/data/template-data";

// ─── BreadcrumbSegment interface (per contracts/README.md) ───

export interface BreadcrumbSegment {
  label: string;
  href: string;
  isCurrentPage: boolean;
  icon?: React.ReactNode;
}

// ─── Mock data lookups ───

const SPACE_MAP: Record<string, { name: string; bannerImage?: string; initials: string }> = {
  "green-energy": { name: "Green Energy Space", initials: "GE", bannerImage: "https://images.unsplash.com/photo-1690191863988-f685cddde463?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100" },
  "sustainable-futures": { name: "Sustainable Futures", initials: "SF", bannerImage: "https://images.unsplash.com/photo-1623652554515-91c833e3080e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100" },
  "sustainability-lab": { name: "Sustainability Lab", initials: "SL", bannerImage: "https://images.unsplash.com/photo-1623652554515-91c833e3080e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100" },
  "urban-mobility": { name: "Urban Mobility Lab", initials: "UM", bannerImage: "https://images.unsplash.com/photo-1735639013995-086e648eaa38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100" },
  "community-garden": { name: "Community Garden", initials: "CG", bannerImage: "https://images.unsplash.com/photo-1768659347532-74d3b1efb0ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100" },
  "innovation-lab": { name: "Innovation Lab", initials: "IL", bannerImage: "https://images.unsplash.com/photo-1676276376052-dc9c9c0b6917?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100" },
};

const SUBSPACE_MAP: Record<string, { name: string; initials: string; avatar?: string; parentSlug: string }> = {
  "renewable-energy-transition": { name: "Renewable Energy Transition", initials: "RE", avatar: "https://images.unsplash.com/photo-1509391366360-2e959784a276?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100", parentSlug: "green-energy" },
  "urban-mobility-lab": { name: "Urban Mobility Lab", initials: "UM", avatar: "https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100", parentSlug: "green-energy" },
  "green-infrastructure": { name: "Green Infrastructure", initials: "GI", avatar: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100", parentSlug: "green-energy" },
};

const SETTINGS_TAB_NAMES: Record<string, string> = {
  about: "About",
  layout: "Layout",
  community: "Community",
  subspaces: "Subspaces",
  templates: "Templates",
  storage: "Storage",
  settings: "Settings",
  account: "Account",
  profile: "Profile",
  updates: "Updates",
};

function slugToName(slug: string): string {
  return SPACE_MAP[slug]?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function spaceAvatar(slug: string): React.ReactNode {
  const space = SPACE_MAP[slug];
  const initials = space?.initials ?? slug.substring(0, 2).toUpperCase();
  const bannerImage = space?.bannerImage;
  return React.createElement(
    Avatar,
    { className: "w-5 h-5", style: { border: "1px solid var(--border)" } },
    bannerImage
      ? React.createElement(AvatarImage, { src: bannerImage, alt: space?.name ?? slug, className: "object-cover" })
      : null,
    React.createElement(AvatarFallback, {
      className: "text-[9px] font-semibold",
      style: { background: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)" },
    }, initials)
  );
}

function subspaceAvatar(slug: string): React.ReactNode {
  const sub = SUBSPACE_MAP[slug];
  const initials = sub?.initials ?? slug.substring(0, 2).toUpperCase();
  const avatarUrl = sub?.avatar;
  return React.createElement(
    Avatar,
    { className: "w-5 h-5", style: { border: "1px solid var(--border)" } },
    avatarUrl
      ? React.createElement(AvatarImage, { src: avatarUrl, alt: sub?.name ?? slug, className: "object-cover" })
      : null,
    React.createElement(AvatarFallback, {
      className: "text-[9px] font-semibold",
      style: { background: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)" },
    }, initials)
  );
}

function logoIcon(): React.ReactNode {
  return React.createElement("div", { className: "w-6 h-6" }, React.createElement(AlkemioSymbolSquare));
}

// ─── Template/Pack lookups ───

function lookupPackName(packSlug: string): string {
  // Pack slugs in routes are pack IDs like "pack-1"
  const pack = TEMPLATE_PACKS.find((p) => p.id === packSlug);
  return pack?.name ?? packSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function lookupTemplateName(templateId: string, packSlug?: string): string {
  // Check pack-specific templates first
  if (packSlug) {
    const packTemplate = PACK_SPECIFIC_TEMPLATES.find((t) => t.id === templateId);
    if (packTemplate) return packTemplate.name;
  }
  const tmpl = INDIVIDUAL_TEMPLATES.find((t) => t.id === templateId);
  return tmpl?.name ?? templateId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Route matching & segment generation ───

export function useBreadcrumbs(): BreadcrumbSegment[] {
  const { pathname } = useLocation();
  const params = useParams();

  // Normalize pathname: remove trailing slash
  const path = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

  // ── Dashboard ── (logo in Header is already the Home link; no extra segments)
  if (path === "/" || path === "/dashboard") {
    return [];
  }

  // ── Browse Spaces ──
  if (path === "/spaces") {
    return [
      { label: "Explore Spaces", href: "/spaces", isCurrentPage: true },
    ];
  }

  // ── Search ──
  if (path === "/search") {
    return [
      { label: "Search", href: "/search", isCurrentPage: true },
    ];
  }

  // ── Admin ──
  if (path.startsWith("/admin")) {
    const section = params.section;
    if (section) {
      const sectionName = section.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return [
        { label: "Admin", href: "/admin", isCurrentPage: false },
        { label: sectionName, href: `/admin/${section}`, isCurrentPage: true },
      ];
    }
    return [
      { label: "Admin", href: "/admin", isCurrentPage: true },
    ];
  }

  // ── Template routes ──
  if (path.startsWith("/templates")) {
    // /templates/packs/:packSlug/:templateId
    const packSlug = params.packSlug;
    const templateId = params.templateId;

    if (packSlug && templateId) {
      return [
        { label: "Template Library", href: "/templates", isCurrentPage: false },
        { label: lookupPackName(packSlug), href: `/templates/packs/${packSlug}`, isCurrentPage: false },
        { label: lookupTemplateName(templateId, packSlug), href: `/templates/packs/${packSlug}/${templateId}`, isCurrentPage: true },
      ];
    }
    // /templates/packs/:packSlug
    if (packSlug) {
      return [
        { label: "Template Library", href: "/templates", isCurrentPage: false },
        { label: lookupPackName(packSlug), href: `/templates/packs/${packSlug}`, isCurrentPage: true },
      ];
    }
    // /templates/:templateId
    if (templateId) {
      return [
        { label: "Template Library", href: "/templates", isCurrentPage: false },
        { label: lookupTemplateName(templateId), href: `/templates/${templateId}`, isCurrentPage: true },
      ];
    }
    // /templates
    return [
      { label: "Template Library", href: "/templates", isCurrentPage: true },
    ];
  }

  // ── User routes ──
  if (path.startsWith("/user/")) {
    const userSlug = params.userSlug;
    const settingsBase = `/user/${userSlug}/settings`;
    const profileHref = `/user/${userSlug}`;

    // Settings sub-pages: Profile > Settings > [Tab Name]
    if (path.startsWith(settingsBase)) {
      const settingsPath = path.slice(settingsBase.length);
      const settingsHref = `/user/${userSlug}/settings/account`;

      if (settingsPath === "/account" || settingsPath === "" || settingsPath === "/") {
        return [
          { label: "Profile", href: profileHref, isCurrentPage: false },
          { label: "Settings", href: settingsHref, isCurrentPage: false },
          { label: "Account", href: settingsHref, isCurrentPage: true },
        ];
      }
      if (settingsPath === "/profile") {
        return [
          { label: "Profile", href: profileHref, isCurrentPage: false },
          { label: "Settings", href: settingsHref, isCurrentPage: false },
          { label: "Profile", href: `${settingsBase}/profile`, isCurrentPage: true },
        ];
      }
      if (settingsPath === "/membership") {
        return [
          { label: "Profile", href: profileHref, isCurrentPage: false },
          { label: "Settings", href: settingsHref, isCurrentPage: false },
          { label: "Membership", href: `${settingsBase}/membership`, isCurrentPage: true },
        ];
      }
      if (settingsPath === "/organizations") {
        return [
          { label: "Profile", href: profileHref, isCurrentPage: false },
          { label: "Settings", href: settingsHref, isCurrentPage: false },
          { label: "Organizations", href: `${settingsBase}/organizations`, isCurrentPage: true },
        ];
      }
      if (settingsPath === "/notifications") {
        return [
          { label: "Profile", href: profileHref, isCurrentPage: false },
          { label: "Settings", href: settingsHref, isCurrentPage: false },
          { label: "Notifications", href: `${settingsBase}/notifications`, isCurrentPage: true },
        ];
      }
      // Generic settings fallback
      const settingName = settingsPath.slice(1).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return [
        { label: "Profile", href: profileHref, isCurrentPage: false },
        { label: "Settings", href: settingsHref, isCurrentPage: false },
        { label: settingName || "Settings", href: path, isCurrentPage: true },
      ];
    }

    // User profile
    return [
      { label: "Profile", href: `/user/${userSlug}`, isCurrentPage: true },
    ];
  }

  // ── Space routes ──
  if (path.startsWith("/space/")) {
    const spaceSlug = params.spaceSlug;
    if (!spaceSlug) {
      return [homeSegment, { label: "Space", href: path, isCurrentPage: true }];
    }

    const spaceName = slugToName(spaceSlug);
    const spaceHref = `/space/${spaceSlug}`;
    const spaceSegment: BreadcrumbSegment = {
      label: spaceName,
      href: spaceHref,
      isCurrentPage: false,
      icon: spaceAvatar(spaceSlug),
    };

    // Space settings
    if (path.startsWith(`${spaceHref}/settings`)) {
      const tab = params.tab;
      if (tab) {
        const tabName = SETTINGS_TAB_NAMES[tab] ?? tab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        return [
          spaceSegment,
          { label: "Settings", href: `${spaceHref}/settings`, isCurrentPage: false },
          { label: tabName, href: `${spaceHref}/settings/${tab}`, isCurrentPage: true },
        ];
      }
      return [
        spaceSegment,
        { label: "Settings", href: `${spaceHref}/settings`, isCurrentPage: true },
      ];
    }

    // Subspace settings: /space/:spaceSlug/subspaces/:subspaceSlug/settings/:tab
    const subspaceSlug = params.subspaceSlug;
    if (subspaceSlug && path.includes(`/subspaces/${subspaceSlug}/settings`)) {
      const subInfo = SUBSPACE_MAP[subspaceSlug];
      const subspaceName = subInfo?.name ?? subspaceSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const subspaceHref = `${spaceHref}/subspaces/${subspaceSlug}`;
      const subspaceSegment: BreadcrumbSegment = {
        label: subspaceName,
        href: subspaceHref,
        isCurrentPage: false,
        icon: subspaceAvatar(subspaceSlug),
      };
      const tab = params.tab;
      if (tab) {
        const tabName = SETTINGS_TAB_NAMES[tab] ?? tab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        return [
          spaceSegment,
          subspaceSegment,
          { label: "Settings", href: `${subspaceHref}/settings`, isCurrentPage: false },
          { label: tabName, href: `${subspaceHref}/settings/${tab}`, isCurrentPage: true },
        ];
      }
      return [
        spaceSegment,
        subspaceSegment,
        { label: "Settings", href: `${subspaceHref}/settings`, isCurrentPage: true },
      ];
    }

    // Subspace page: /space/:spaceSlug/subspaces/:subspaceSlug
    if (subspaceSlug) {
      const subInfo = SUBSPACE_MAP[subspaceSlug];
      const subspaceName = subInfo?.name ?? subspaceSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return [
        spaceSegment,
        {
          label: subspaceName,
          href: `${spaceHref}/subspaces/${subspaceSlug}`,
          isCurrentPage: true,
          icon: subspaceAvatar(subspaceSlug),
        },
      ];
    }

    // Post detail (if route existed: /space/:spaceSlug/posts/:postSlug)
    const postSlug = params.postSlug;
    if (postSlug) {
      const postTitle = postSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return [
        spaceSegment,
        { label: postTitle, href: `${spaceHref}/posts/${postSlug}`, isCurrentPage: true },
      ];
    }

    // Space home + tab routes → breadcrumb stays at space level
    // Tabs: /community, /subspaces, /knowledge-base do NOT add a segment
    return [
      { ...spaceSegment, isCurrentPage: true },
    ];
  }

  // ── Fallback: Page Not Found ──
  return [
    { label: "Page Not Found", href: path, isCurrentPage: true },
  ];
}
