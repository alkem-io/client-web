// spec.js
var pageObjectAuth = require('./page-object-auth.js');
var pageObjectEcoverse = require('./page-object-ecoverse.js');
var pageObjectAdmin = require('./page-object-admin.js');
const { browser } = require('protractor');

beforeAll(async function () {
  await browser.waitForAngularEnabled(false);
  await pageObjectAuth.authenticate();
});

describe('CT E2E tests', function () {
  it('Admin', async function () {
    await pageObjectAdmin.pressHamburgerButton();
    await pageObjectAdmin.pressAdminOption();
    await pageObjectAdmin.verifyUserIsOnAdminPage();
    await pageObjectAdmin.pressManageButtonChallanges();
    await pageObjectAdmin.searchAChallenge();
    await pageObjectAdmin.selectResultFromSearchedChallenge();
    await pageObjectAdmin.selectManagaButtonOpportunities();
    await pageObjectAdmin.selectOpportunityFromList();
    await pageObjectAdmin.selectManageGroupsButtonOpportunities();
    await pageObjectAdmin.selectCreateNewGroupButtonOpportunity();
    await pageObjectAdmin.setGroupNameInputFieldOpportunity();
    await pageObjectAdmin.selectcreateGroupButtonOpportunity();
    expect(await pageObjectAdmin.userInList).toBeVisible;
    expect(await pageObjectAdmin.verifyUserAvailability).not.toBeVisible;
    await pageObjectAdmin.addUserToOpportunityGroup();
    expect(await pageObjectAdmin.verifyUserAvailability).toBeVisible;
    await pageObjectAdmin.removeUserFromOpportunityGroup();
    expect(await pageObjectAdmin.verifyUserAvailability).not.toBeVisible;
    await pageObjectAdmin.navigateToOpportunityInfoPage();
    await pageObjectAdmin.selectManageGroupsButtonOpportunities();
    await pageObjectAdmin.setRemoveOpportunityGroup();
    //browser.sleep(10000)
  });

  it('Ecoverse', async function () {
    await pageObjectEcoverse.clicksEcoverseButton();
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
