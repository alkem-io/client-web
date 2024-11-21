import { Ribbon, RibbonProps } from './Ribbon';
import { RibbonText } from '../typography';

interface CardRibbonProps extends RibbonProps {
  text: string;
}

const CardRibbon = ({ text, sx, ...rest }: CardRibbonProps) => (
  <Ribbon padding={0.5} sx={{ position: 'absolute', bottom: 0, width: '100%', ...sx }} {...rest}>
    <RibbonText>{text}</RibbonText>
  </Ribbon>
);

export default CardRibbon;
