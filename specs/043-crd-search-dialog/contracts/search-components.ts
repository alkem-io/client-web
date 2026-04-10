/**
 * CRD Search Component Contracts
 *
 * These TypeScript interfaces define the prop types for CRD search components.
 * All types are plain TypeScript — no GraphQL types, no MUI types.
 *
 * Location: src/crd/components/search/
 */

import type { ComponentType } from 'react';

// ── Result Card Data Types ──

export type PostType = 'post' | 'whiteboard' | 'memo';

export type PostResultCardData = {
  id: string;
  title: string;
  snippet: string;
  type: PostType;
  bannerUrl?: string;
  author: { name: string; avatarUrl?: string };
  date: string;
  spaceName: string;
  href: string;
};

export type ResponseResultCardData = {
  id: string;
  title: string;
  snippet: string;
  type: PostType;
  author: { name: string; avatarUrl?: string };
  date: string;
  parentPostTitle: string;
  spaceName: string;
  href: string;
};

export type UserResultCardData = {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
  email?: string;
  href: string;
};

export type OrgResultCardData = {
  id: string;
  name: string;
  logoUrl?: string;
  type: string;
  tagline?: string;
  href: string;
};

// ── Filter ──

export type SearchFilterOption = {
  value: string;
  label: string;
};

export type SearchFilterConfig = {
  options: SearchFilterOption[];
};

// ── Category ──

export type SearchCategoryId = 'spaces' | 'posts' | 'responses' | 'users' | 'organizations';

export type SearchCategoryData = {
  id: SearchCategoryId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  count: number;
  filterConfig?: SearchFilterConfig;
  activeFilter: string;
  onFilterChange: (value: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
};

// ── Scope ──

export type SearchScopeData = {
  currentSpaceName: string;
  activeScope: 'all' | string;
};

// ── Search Tag Input ──

export type SearchTagInputProps = {
  tags: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onTagAdd: (term: string) => void;
  onTagRemove: (index: number) => void;
  maxTags: number;
  minLength: number;
  placeholder: string;
  scope?: SearchScopeData;
  onScopeChange?: (scope: 'all' | string) => void;
  onClose: () => void;
};

// ── Category Sidebar ──

export type SearchCategorySidebarProps = {
  categories: SearchCategoryData[];
  activeCategoryId: SearchCategoryId | null;
  onCategoryClick: (id: SearchCategoryId) => void;
};

// ── Result Section ──

export type SearchResultSectionProps = {
  category: SearchCategoryData;
  children: React.ReactNode; // rendered result cards
};

// ── Post Result Card ──

export type PostResultCardProps = {
  post: PostResultCardData;
  onClick: () => void;
};

// ── Response Result Card ──

export type ResponseResultCardProps = {
  response: ResponseResultCardData;
  onClick: () => void;
};

// ── User Result Card ──

export type UserResultCardProps = {
  user: UserResultCardData;
  onClick: () => void;
};

// ── Organization Result Card ──

export type OrgResultCardProps = {
  org: OrgResultCardData;
  onClick: () => void;
};

// ── Search Overlay (top-level CRD component) ──

export type SearchOverlayState = 'empty' | 'loading' | 'results' | 'no-results';

export type SearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  state: SearchOverlayState;
  tags: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onTagAdd: (term: string) => void;
  onTagRemove: (index: number) => void;
  maxTags: number;
  scope?: SearchScopeData;
  onScopeChange?: (scope: 'all' | string) => void;
  categories: SearchCategoryData[];
  activeCategoryId: SearchCategoryId | null;
  onCategoryClick: (id: SearchCategoryId) => void;
  disclaimer: string;
  noResultsMessage: string;
  searchAllLabel?: string;
  onSearchAll?: () => void;
};
