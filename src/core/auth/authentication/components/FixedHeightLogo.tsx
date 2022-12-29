import LogoComponent from '../../../../common/components/composite/layout/TopBar/LogoComponent';
import { gutters } from '../../../ui/grid/utils';

/**
 * The purpose of this component is to play nice with vertical rhythm by having height=2*GUTTER
 * @constructor
 */
const FixedHeightLogo = () => {
  return <LogoComponent height={gutters(2)} />;
};

export default FixedHeightLogo;
