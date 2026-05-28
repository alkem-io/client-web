export type HubSettingsTabKey = 'about' | 'spaces';

export type HubSettingsHeaderData = {
  name: string;
  tagline: string;
  bannerImageUrl?: string;
  thumbnailColor: string;
  initials: string;
  viewHubUrl: string;
};

export type HubAboutSectionKey = 'subdomain' | 'name' | 'tagline' | 'description' | 'tags' | 'banner';

export type HubAboutSectionSaveStatus = 'idle' | 'saving' | 'saved';
