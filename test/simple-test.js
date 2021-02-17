// spec.js
var pageObjectAuth = require('./page-object-auth.js');
var pageObjectEcoverse = require('./page-object-ecoverse.js');
const { browser } = require('protractor');

beforeAll(async function () {
  await browser.waitForAngularEnabled(false);
  await pageObjectAuth.authenticate();
});

describe('Search', function () {
  it('experiment', async function () {
    expect(await pageObjectAuth.ecoverseTitle).toBeVisible;
    await pageObjectEcoverse.exploreChallenge();
    expect(await pageObjectEcoverse.onExploreChallengeTitle()).toBeVisible;
    await pageObjectEcoverse.pressEditChallengeButton();
    await pageObjectEcoverse.selectAddChallengeReferenceButton();
    await pageObjectEcoverse.populateAddChallengeReferenceNameAndUri();
    await pageObjectEcoverse.selectAddChallengeReferenceSave();
    expect(await pageObjectEcoverse.verifyAddedCHallengeReference()).toBeVisible;
    await pageObjectEcoverse.pressEditChallengeButton();
    await pageObjectEcoverse.selectRemoveChallengeReferenceButton();
    await pageObjectEcoverse.selectAddChallengeReferenceSave();
    expect(await pageObjectEcoverse.verifyAddedCHallengeReference()).not.toBeVisible;
  });
});
