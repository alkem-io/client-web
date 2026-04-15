import type { SaveBarState } from './shell';

export type AboutFormValues = {
  name: string;
  tagline: string;
  pageBannerUrl: string | null;
  cardBannerUrl: string | null;
  avatarUrl: string | null;
  tags: string[];
  vision: string;
  mission: string;
  impact: string;
  who: string;
};

export type SpaceCardPreview = {
  name: string;
  tagline: string;
  bannerUrl: string | null;
  avatarUrl: string | null;
  tags: string[];
};

export type AboutViewProps = AboutFormValues & {
  previewCard: SpaceCardPreview;
  saveBar: SaveBarState;
  onChange: (patch: Partial<AboutFormValues>) => void;
  onSave: () => void;
  onReset: () => void;
  onUploadPageBanner: (file: File) => void;
  onUploadCardBanner: (file: File) => void;
  onUploadAvatar: (file: File) => void;
};
