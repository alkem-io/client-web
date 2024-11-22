import LogoComponent from '@/main/ui/layout/topBar/LogoComponent';
import { gutters } from '@/core/ui/grid/utils';

/**
 * The purpose of this component is to play nice with vertical rhythm by having height=2*GUTTER
 * @constructor
 */
const FixedHeightLogo = () => {
  return <LogoComponent height={gutters(2)} />;
};

export default FixedHeightLogo;
