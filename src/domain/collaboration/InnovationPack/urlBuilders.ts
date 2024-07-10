import { TopLevelRoutePath } from '../../../main/routing/TopLevelRoutePath';

export const buildInnovationPackUrl = (innovationPackNameId: string) =>
  `/${TopLevelRoutePath.InnovationPacks}/${innovationPackNameId}`;

export const buildInnovationPackSettingsUrl = (innovationPackNameId: string) =>
  `${buildInnovationPackUrl(innovationPackNameId)}/settings`;
