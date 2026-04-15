export type EntitlementRow = {
  feature: string;
  limit: number | 'unlimited';
  usage: number;
};

export type AccountViewProps = {
  plan: {
    name: string;
    description: string;
  };
  entitlements: EntitlementRow[];
  contactAdminHref: string | null;
};
