import { Identifiable } from '../../../../core/utils/Identifiable';

export interface TemplateBase extends Identifiable {
  description?: string;
  tags?: string[];
}

export interface TemplateBaseWithValue extends TemplateBase {}

export interface TemplateCardBaseProps<Template extends TemplateBase> {
  template?: Template;
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export interface TemplatePreviewBaseProps<TemplateValue extends TemplateBaseWithValue> {
  template?: TemplateValue;
}
