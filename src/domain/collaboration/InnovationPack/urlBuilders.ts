export const innovationPacksPath = '/innovation-packs';

export const buildInnovationPackUrl = (innovationPackNameId: string) =>
  `${innovationPacksPath}/${innovationPackNameId}`;

export const buildInnovationPackSettingsUrl = (innovationPackNameId: string) =>
  `${buildInnovationPackUrl(innovationPackNameId)}/settings`;
