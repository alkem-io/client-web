### ReleaseNotesBanner

##### The banner visibility logic depends on:

1. platform.latestReleaseDiscussion from LatestReleaseDiscussion query;
2. the `releaseNotes.url` value from the translations (it's added to the local storage once closed, so make sure it's unique);
   1. note that you can control the banner wrapper to be static (not clickable) by setting the `releaseNotes.isClickable` value to "FALSE" and to "TRUE" if you want to be clickable (navigating to the url value); The `releaseNotes.isClickable: "FALSE"` is useful if you're updating the users with terms and privacy (internal links);

##### Regarding formatting you can use the following tags:

- `<small></small>`
- `<big></big>`
- `<terms></terms>`
- `<privacy></privacy>`
- `<icon />` - currently displaying CampaignOutlinedIcon
