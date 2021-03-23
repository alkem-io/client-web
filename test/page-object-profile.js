const { browser, element, by } = require('protractor');

const PageObjectsAdmin = function () {
  var EC = protractor.ExpectedConditions;

  const profileSelector = element(by.css('[href="/profile"]'));
  this.opensUserProfile = async function () {
    await profileSelector.click();
    console.log('Opens user profile.');
  };

  const verifyUserName = element(by.cssContainingText('h2 span', 'admin cherrytwist'));
  const verifyUserEmail = element(by.cssContainingText('.ct-card-body span', 'admin@cherrytwist.org'));
  this.verifyUserProfile = async function () {
    await browser.wait(EC.visibilityOf(verifyUserName), 60000);
    await browser.wait(EC.visibilityOf(verifyUserEmail), 60000);
    console.log('Verifies user details.');
  };

  const editButtonUserProfile = element(by.css('.align-items-end svg'));
  this.clicksEditUserButton = async function () {
    await editButtonUserProfile.click();
    console.log('Selects edit user profile button.');
  };

  const profilePageLabel = element(by.cssContainingText('.mt-5.container', 'Profile'));
  this.verifyUserProfileEditPage = async function () {
    await browser.wait(EC.visibilityOf(profilePageLabel), 60000);
    console.log('Verifies user is on profile edit page.');
  };

  const profilePhoneInput = element(by.css('[name="phone"]'));
  this.setPhoneNumber = async function () {
    await browser.wait(EC.visibilityOf(profilePhoneInput), 60000);
    await profilePhoneInput.clear();
    await profilePhoneInput.sendKeys('+35966666666');
    console.log('Sets phone number.');
  };

  const saveButtonPEditProfilePage = element(by.css('button.ml-3.btn.btn-primary'));
  this.clicksSaveUserButton = async function () {
    await saveButtonPEditProfilePage.click();
    console.log('Saves user profile changes.');
  };

  const notificationUserUpdate = element(by.cssContainingText('.toast-body', 'User updated successfully'));
  this.verifyNotificationUserUpdate = async function () {
    await browser.wait(EC.visibilityOf(notificationUserUpdate), 60000);
  };

  const phoneFieldUserProfilePage = element(by.cssContainingText('div span', '+35966666666'));
  this.verifyPhoneFieldUserProfilePage = async function () {
    await browser.wait(EC.visibilityOf(phoneFieldUserProfilePage), 60000);
  };

  this.changePhoneNumber = async function () {
    await browser.wait(EC.visibilityOf(profilePhoneInput), 60000);
    await profilePhoneInput.clear();
    await profilePhoneInput.sendKeys('35977777777');
    console.log('Sets phone number.');
  };
};

module.exports = new PageObjectsAdmin();
