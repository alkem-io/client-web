const { browser, element, by } = require('protractor');

const PageObjectsEcoverse = function () {
  var EC = protractor.ExpectedConditions;

  const ecoverseTitle = element(by.cssContainingText('h2 span', 'Cherrytwist'));
  const ecoverseButton = element(by.css('[href="/"]'));
  this.clicksEcoverseButton = async function () {
    await ecoverseButton.click();
    await browser.wait(EC.visibilityOf(ecoverseTitle), 60000);
  };

  const selectChallenge = element(by.css('[href="/ecoverse/1/challenges/balance-grid"]'));
  this.exploreChallenge = async function () {
    await selectChallenge.click();
  };

  const onChallengeTitle = element(by.cssContainingText('h2 span', 'Balance the grid'));
  this.onExploreChallengeTitle = async function () {
    await browser.wait(EC.visibilityOf(onChallengeTitle), 60000);
  };

  const editChallengeButton = element(by.css('.d-flex.align-items-center svg'));
  this.pressEditChallengeButton = async function () {
    await browser.wait(EC.visibilityOf(editChallengeButton), 60000);
    await editChallengeButton.click();
  };

  const addChallengeReferenceButton = element(by.css('.d-flex.mb-4.align-items-center button'));
  this.selectAddChallengeReferenceButton = async function () {
    await browser.wait(EC.visibilityOf(addChallengeReferenceButton), 60000);
    await addChallengeReferenceButton.click();
  };

  const addChallengeReferenceName = element(by.css('[name="references.4.name"]'));
  const addChallengeReferenceUri = element(by.css('[name="references.4.uri"]'));
  this.populateAddChallengeReferenceNameAndUri = async function () {
    await browser.wait(EC.visibilityOf(addChallengeReferenceName), 60000);
    await addChallengeReferenceName.sendKeys('test');
    await addChallengeReferenceUri.sendKeys('test');
  };

  const addChallengeReferenceSave = element(by.css('.modal-footer [type="submit"]'));
  this.selectAddChallengeReferenceSave = async function () {
    await browser.wait(EC.visibilityOf(addChallengeReferenceSave), 60000);
    await addChallengeReferenceSave.click();
  };

  const addedCHallengeReference = element(by.css('.d-flex.flex-column div a[href="test"]'));
  this.verifyAddedCHallengeReference = async function () {
    await browser.wait(EC.visibilityOf(addedCHallengeReference), 60000);
  };

  const removeChallengeReferenceButton = element(by.css('.modal-body div div:last-child>button'));
  this.selectRemoveChallengeReferenceButton = async function () {
    await browser.wait(EC.visibilityOf(removeChallengeReferenceButton), 60000);
    await removeChallengeReferenceButton.click();
  };
};

module.exports = new PageObjectsEcoverse();
