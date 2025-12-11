import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';

/**
 * Edit path for L0 space layout settings (used with tabbed layout)
 */
export const SPACE_LAYOUT_EDIT_PATH = `./${EntityPageSection.Settings}/${SettingsSection.Layout}`;

/**
 * Edit path for subspace (L1/L2) about section with description anchor
 */
export const SUBSPACE_ABOUT_EDIT_PATH = `./${EntityPageSection.Settings}/${SettingsSection.About}#description`;
