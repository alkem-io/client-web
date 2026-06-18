import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

interface HelpButtonProps {
  helpText: string;
  fontSize?: 'inherit' | 'large' | 'medium' | 'small';
}

const SIZE_BY_FONT_SIZE: Record<NonNullable<HelpButtonProps['fontSize']>, string> = {
  inherit: 'size-[1em]',
  small: 'size-5',
  medium: 'size-6',
  large: 'size-9',
};

const HelpButton = ({ helpText, fontSize = 'small' }: HelpButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild={true}>
        <HelpCircle className={`ml-2 text-primary ${SIZE_BY_FONT_SIZE[fontSize]}`} aria-label={helpText} />
      </TooltipTrigger>
      <TooltipContent side="right">{helpText}</TooltipContent>
    </Tooltip>
  );
};

export default HelpButton;
