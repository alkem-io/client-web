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

export interface TemplateCardBaseProps<Template extends TemplateBase = TemplateBase> {
  template?: Template;
  innovationPack?: {
    profile: {
      displayName: string;
    };
    provider?: {
      profile: {
        displayName: string;
        avatar?: Visual;
      };
    };
  };
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export interface TemplatePreviewBaseProps<TemplateWithContent extends TemplateBase> {
  template?: TemplateWithContent;
}
