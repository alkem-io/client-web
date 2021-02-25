// spec.js
const pageObjectAuth = require('./page-object-auth.js');
const pageObjectEcoverse = require('./page-object-ecoverse.js');
const pageObjectAdmin = require('./page-object-admin.js');
const pageObjectProfile = require('./page-object-profile.js');
const pageObjectsCommunity = require('./page-object-community.js');
const { browser } = require('protractor');
const pageObjectCommunity = require('./page-object-community.js');

describe('CT E2E tests - unauthenticated', function () {
  beforeAll(async function () {
    await browser.waitForAngularEnabled(false);
    await pageObjectAuth.unauthenticated();
  });

  it('Admin', async function () {
    expect(pageObjectAdmin.hamburgerButton).not.toBeVisible;
    expect(pageObjectAdmin.adminOption).not.toBeVisible;
  });

  it('Community', async function () {
    expect(pageObjectCommunity.communitySelector).toBeDisabled;
  });

  it('User Profile', async function () {
    expect(pageObjectProfile.profileSelector).not.toBeVisible;
  });

  it('Ecoverse', async function () {
    await pageObjectEcoverse.clicksEcoverseButton();
    expect(pageObjectAuth.ecoverseTitle).toBeVisible;
    await pageObjectEcoverse.exploreChallenge();
    expect(await pageObjectEcoverse.onExploreChallengeTitle()).toBeVisible;
    expect(pageObjectEcoverse.editChallengeButton).not.toBeVisible;
  });
});

describe('CT E2E tests - authenticated', function () {
  beforeAll(async function () {
    await browser.waitForAngularEnabled(false);
    await pageObjectAuth.authenticate();
  });

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

  it('Community', async function () {
    await pageObjectsCommunity.opensCommunityPage();
    await pageObjectsCommunity.verifyCommunityPage();
    await pageObjectsCommunity.setSearchValue();
    await pageObjectsCommunity.verifyEntityAvailability();
    await pageObjectsCommunity.openCard();
    expect(await pageObjectsCommunity.verifyEntityAvailabilityOnOpenModal()).toBeVisible;
    await pageObjectsCommunity.closesModalDialog();
  });

  it('User Profile', async function () {
    await pageObjectProfile.opensUserProfile();
    await pageObjectProfile.verifyUserProfile();
    await pageObjectProfile.clicksEditUserButton();
    await pageObjectProfile.verifyUserProfileEditPage();
    await pageObjectProfile.setPhoneNumber();
    await pageObjectProfile.clicksSaveUserButton();
    await pageObjectProfile.verifyNotificationUserUpdate();
    await pageObjectProfile.opensUserProfile();
    await pageObjectProfile.verifyUserProfile();
    expect(await pageObjectProfile.verifyPhoneFieldUserProfilePage).toBeVisible;
    await pageObjectProfile.clicksEditUserButton();
    await pageObjectProfile.changePhoneNumber();
    await pageObjectProfile.clicksSaveUserButton();
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
    expect(await pageObjectEcoverse.verifyAddedChallengeReference()).toBeVisible;
    await pageObjectEcoverse.pressEditChallengeButton();
    await pageObjectEcoverse.selectRemoveChallengeReferenceButton();
    await pageObjectEcoverse.selectAddChallengeReferenceSave();
    expect(pageObjectEcoverse.addedChallengeReference).not.toBeVisible;
  });
});


