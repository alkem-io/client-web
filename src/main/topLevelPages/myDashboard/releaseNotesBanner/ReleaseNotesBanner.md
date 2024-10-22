### ReleaseNotesBanner

##### The banner visibility logic depends on:

1. platform.latestReleaseDiscussion from LatestReleaseDiscussion query;
2. the `releaseNotes.url` value from the translations (it's added to the local storage once closed, so make sure it's unique);
   1. note that you can control the banner wrapper to be static (not clickable) by passing an optional parameter 'NOT_CLICKABLE' in the url value e.g. `termsUpdateOct.24?NOT_CLICKABLE`; The default behaviour is clickable navigating to the URL value;

##### Regarding formatting you can use the following tags:

- `<small></small>`
- `<big></big>`
- `<terms></terms>`
- `<privacy></privacy>`
- `<icon />` - currently displaying CampaignOutlinedIcon
