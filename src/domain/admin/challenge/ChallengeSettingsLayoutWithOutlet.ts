import createLayoutWithOutlet from '../../shared/layout/LayoutHolderWithOutlet';
import ChallengeSettingsLayout from './ChallengeSettingsLayout';

const { LayoutHolder, Layout } = createLayoutWithOutlet(ChallengeSettingsLayout);

export { LayoutHolder as ChallengeSettingsLayoutHolder };
export default Layout;
