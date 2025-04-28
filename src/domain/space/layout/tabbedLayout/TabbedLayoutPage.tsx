// Keep these in sync with the consts in urlBuilders.ts and don't import,
// tests fail to import because they are in different modules
export const URL_PARAM_SECTION = 'tab';
export const URL_PARAM_DIALOG = 'dialog';

export enum TabbedLayoutParams {
  Section = URL_PARAM_SECTION,
  Dialog = URL_PARAM_DIALOG,
}

export type TabbedLayoutDialogsType = 'about' | 'updates' | 'contributors' | 'calendar';

export type TabbedLayoutPageProps = {
  sectionNumber?: string; // Base 1 tab number
  dialog?: string;
};
