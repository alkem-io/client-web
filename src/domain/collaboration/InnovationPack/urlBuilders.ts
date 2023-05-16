export const innovationPacksPath = '/innovation-packs';

export const buildInnovationPackUrl = (innovationPackNameId: string) =>
  `${innovationPacksPath}/${innovationPackNameId}`;

export const buildInnovationPackSettingsUrl = (innovationPackNameId: string) =>
  `/admin/innovation-packs/${innovationPackNameId}`;
