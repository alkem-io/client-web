const { browser, element, by } = require('protractor');

const PageObjectsAdmin = function () {
  var EC = protractor.ExpectedConditions;

  const hamburgerButton = element(by.css('.col div div div button svg'));
  this.pressHamburgerButton = async function () {
    await hamburgerButton.click();
    console.log('Opens hamburger menu.');
  };

  const adminOption = element(by.css('#popover-contained [href="/admin"] div'));
  this.pressAdminOption = async function () {
    await adminOption.click();
    console.log('Selects admin option.');
  };

  const adminPageTitle = element(by.css('.container-fluid [href="/admin"]'));
  this.verifyUserIsOnAdminPage = async function () {
    await browser.wait(EC.visibilityOf(adminPageTitle), 60000);
    console.log('Verifies user is navigated to admin page.');
  };

  const manageButtonChallanges = element(by.css('[href="/admin/challenges"]'));
  this.pressManageButtonChallanges = async function () {
    await manageButtonChallanges.click();
    console.log('Press manage button of opportunity.');
  };

  const searchFieldChallenges = element(by.css('input.form-control'));
  this.searchAChallenge = async function () {
    await browser.wait(EC.visibilityOf(searchFieldChallenges), 60000);
    await searchFieldChallenges.sendKeys('QA');
    console.log('Searches for opportunity with name: QA.');
  };

  const resultFromSearchChallengeList = element(by.cssContainingText('.list-group a ', 'qa'));
  this.selectResultFromSearchedChallenge = async function () {
    await resultFromSearchChallengeList.click();
    console.log('Selects the result: challenge with name: QA.');
  };

  const managaButtonOpportunities = element(
    by.cssContainingText('[href="/admin/challenges/45/opportunities"]', 'Manage')
  );
  this.selectManagaButtonOpportunities = async function () {
    await browser.wait(EC.visibilityOf(managaButtonOpportunities), 60000);
    await managaButtonOpportunities.click();
    console.log('Press managa button for opportunities.');
  };

  const opportunityFromList = element(by.cssContainingText('.list-group a', 'qa'));
  this.selectOpportunityFromList = async function () {
    await browser.wait(EC.visibilityOf(opportunityFromList), 60000);
    await opportunityFromList.click();
    console.log('Opens opportunity with name: QA.');
  };

  const manageGroupsButtonOpportunities = element(by.cssContainingText('div span', 'Manage'));
  this.selectManageGroupsButtonOpportunities = async function () {
    await browser.wait(EC.visibilityOf(manageGroupsButtonOpportunities), 60000);
    await manageGroupsButtonOpportunities.click();
    console.log('Press managa button on opportunity section.');
  };

  const createNewGroupButtonOpportunity = element(by.css('.d-flex.mb-4 a'));
  this.selectCreateNewGroupButtonOpportunity = async function () {
    await browser.wait(EC.visibilityOf(createNewGroupButtonOpportunity), 60000);
    await createNewGroupButtonOpportunity.click();
    console.log('Press create new group button for opportunity.');
  };

  const groupNameInputFieldOpportunity = element(by.css('input.form-control'));
  this.setGroupNameInputFieldOpportunity = async function () {
    await browser.wait(EC.visibilityOf(groupNameInputFieldOpportunity), 60000);
    await groupNameInputFieldOpportunity.sendKeys('QA group');
    console.log('Sets name for opportunity group.');
  };
  const createGroupButtonOpportunity = element(by.css('.d-flex button'));
  this.selectcreateGroupButtonOpportunity = async function () {
    await createGroupButtonOpportunity.click();
    console.log('Press "Create" button - opportunity group.');
  };

  const userInList = element(by.cssContainingText('.col-sm-4 .table-responsive-sm tbody tr td', 'admin cherrytwist'));
  const verifyUserAvailability = element(
    by.cssContainingText('.col .table-responsive-sm tbody tr td', 'admin cherrytwist')
  );
  const removeButtonAdminUser = element(by.css('.col .table-responsive-sm tbody tr td button'));
  const addButtonAdminUser = element(by.css('.col-sm-4 .table-responsive-sm tbody tr td button'));
  this.addUserToOpportunityGroup = async function () {
    await browser.wait(EC.visibilityOf(addButtonAdminUser), 60000);
    await addButtonAdminUser.click();
    console.log('Adds user to opportunity group.');
  };

  this.removeUserFromOpportunityGroup = async function () {
    await browser.wait(EC.visibilityOf(removeButtonAdminUser), 60000);
    await removeButtonAdminUser.click();
    console.log('Removes user from opportunity group.');
  };

  const navigateToOpportunityInfo = element(by.css('.flex-column [href="/admin/challenges/45/opportunities/111"]'));
  const verifyOpportunityInfo = element(by.cssContainingText('.container h4 span', 'Opportunity info'));
  this.navigateToOpportunityInfoPage = async function () {
    await navigateToOpportunityInfo.click();
    await browser.wait(EC.visibilityOf(verifyOpportunityInfo), 60000);
    console.log('Navigates back to opportunity info page.');
  };

  const removeOpportunityGroup = element(by.css('.list-group a:nth-child(2) button'));
  const verifyOpportunityGroupIsRemoved = element(by.cssContainingText('.list-group a', 'QA group'));
  const removeOpportunityGroupButton = element(by.cssContainingText('.modal-content button', 'Remove'));
  this.setRemoveOpportunityGroup = async function () {
    await browser.wait(EC.visibilityOf(removeOpportunityGroup), 60000);
    await removeOpportunityGroup.click();
    await browser.wait(EC.visibilityOf(removeOpportunityGroupButton), 60000);
    await removeOpportunityGroupButton.click();
    await browser.wait(EC.invisibilityOf(verifyOpportunityGroupIsRemoved), 60000);
    console.log('Removes opportunity group.');
  };
};

module.exports = new PageObjectsAdmin();
