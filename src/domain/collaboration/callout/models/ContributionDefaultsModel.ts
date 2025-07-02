export interface ContributionDefaultsModel {
  defaultDisplayName?: string;
  postDescription?: string;
  whiteboardContent?: string;
}

export const mapContributionDefaultsModelToCalloutFormValues = (
  contributionDefaults: ContributionDefaultsModel | undefined
): ContributionDefaultsModel | undefined =>
  contributionDefaults
    ? {
        defaultDisplayName: contributionDefaults.defaultDisplayName,
        postDescription: contributionDefaults.postDescription,
        whiteboardContent: contributionDefaults.whiteboardContent,
      }
    : undefined;
