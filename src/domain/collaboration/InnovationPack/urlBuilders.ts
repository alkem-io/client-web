const rootPath = '/innovation-pack';

export const buildInnovationPackUrl = (innovationPackNameId: string) => `${rootPath}/${innovationPackNameId}`;

export const buildInnovationPackSettingsUrl = (innovationPackNameId: string) =>
  `${buildInnovationPackUrl(innovationPackNameId)}/settings`;
