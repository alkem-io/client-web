import LogoComponent from '../../../../common/components/composite/layout/TopBar/LogoComponent';
import { GUTTER } from '../../../../domain/shared/layout/Grid';

/**
 * The purpose of this component is to play nice with vertical rhythm by having height=2*GUTTER
 * @constructor
 */
const FixedHeightLogo = () => {
  return <LogoComponent height={theme => theme.spacing(2 * GUTTER)} />;
};

export default FixedHeightLogo;
