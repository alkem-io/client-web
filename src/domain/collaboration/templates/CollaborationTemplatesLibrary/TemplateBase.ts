import { Visual } from '../../../common/visual/Visual';

export interface TemplateBase {
  profile: {
    displayName: string;
    description?: string;
    tagset?: {
      tags: string[];
    };
    visual?: Visual;
  };
}

interface TemplateInnovationPack {
  profile: {
    displayName: string;
  };
  provider?: {
    profile: {
      displayName: string;
      avatar?: Visual;
    };
  };
}

export interface InnovationPackTemplate extends TemplateBase {
  innovationPack?: TemplateInnovationPack;
}

export interface TemplateCardBaseProps<Template extends TemplateBase = TemplateBase> {
  template?: Template;
  innovationPack?: TemplateInnovationPack;
  loading?: boolean;
  to?: string;
  state?: Record<string, unknown>;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}
