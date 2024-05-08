import { TemplateBase } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';

export interface MemberGuidelinesTemplate extends TemplateBase {
  defaultDescription: string;
  type: string;
}

export interface MemberGuidelinesTemplateWithValue extends MemberGuidelinesTemplate {}
