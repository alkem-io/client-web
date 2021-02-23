const { browser, element, by } = require('protractor');

const PageObjectsCommunity = function () {
  var EC = protractor.ExpectedConditions;

  const communitySelector = element(by.css('[href="/community"]'));
  this.opensCommunityPage = async function () {
    await communitySelector.click();
    console.log('Opens community page.');
  };

  const verifyCommunityTitle = element(by.cssContainingText('h2 span', 'Community'));
  const communitySearchImput = element(by.css('section input'));
  this.verifyCommunityPage = async function () {
    await browser.wait(EC.visibilityOf(verifyCommunityTitle), 60000);
    await browser.wait(EC.visibilityOf(communitySearchImput), 60000);
    console.log('Verifies community page is open.');
  };

  const searchButton = element(by.css('section button svg'));
  this.setSearchValue = async function () {
    await communitySearchImput.sendKeys('admin');
    await searchButton.click();
    console.log('Search for keyword: admin.');
  };

  const entityDetailsTitle = element(by.cssContainingText('.ct-card-body h4 span', 'admin cherrytwist'));
  const entityDetailsMatchedTerm = element(by.cssContainingText('.ct-card-body div span', 'admin'));
  this.verifyEntityAvailability = async function () {
    await browser.wait(EC.visibilityOf(entityDetailsTitle), 60000);
    await browser.wait(EC.visibilityOf(entityDetailsMatchedTerm), 60000);
    console.log('Verifies search result contains card with admin details.');
  };

  this.openCard = async function () {
    await entityDetailsTitle.click();
    console.log('Verifies search result contains card with admin details.');
  };

  const modalTitle = element(by.cssContainingText('.modal-content .ml-3 span', 'admin cherrytwist'));
  const modalContactInfo = element(by.cssContainingText('.modal-content p span', 'admin@cherrytwist.org'));
  this.verifyEntityAvailabilityOnOpenModal = async function () {
    await browser.wait(EC.visibilityOf(modalContactInfo), 60000);
    await browser.wait(EC.visibilityOf(modalTitle), 60000);
    console.log('Verifies modal contact details.');
  };

  const closeButtonModal = element(by.css('.modal-footer button'));
  this.closesModalDialog = async function () {
    await closeButtonModal.click();
    console.log('Closes modal dialog.');
  };
};

module.exports = new PageObjectsCommunity();
