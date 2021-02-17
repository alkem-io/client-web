const { browser, element, by } = require('protractor');

const PageObjects = function () {
  var EC = protractor.ExpectedConditions;
  // Authentication
  const signInButton = element(by.cssContainingText('button div span', 'Sign in'));
  const loginPage = element(by.cssContainingText('#loginHeader', 'Sign in'));
  const usernameField = element(by.css('.ext-text-box'));
  const passwordField = element(by.cssContainingText('#loginHeader', 'Enter password'));
  const confirmPageStaySignedIn = element(by.cssContainingText('.text-title', 'Stay signed in?'));
  const nextButton = element(by.css('#idSIButton9'));
  const takeMeHomeButton = element(by.cssContainingText('div span', 'Take me home'));
  const ecoverseTitle = element(by.cssContainingText('h2 span', 'Cherrytwist'));

  this.authenticate = async function () {
    await browser.get(browser.params.login.url);
    await browser.wait(EC.visibilityOf(loginPage), 60000);
    await usernameField.click();
    await usernameField.sendKeys(browser.params.login.email);
    await nextButton.click();

    await browser.wait(EC.visibilityOf(passwordField), 60000);

    await usernameField.click();
    await usernameField.sendKeys(browser.params.login.password);
    await nextButton.click();

    await browser.wait(EC.visibilityOf(confirmPageStaySignedIn), 60000);
    await nextButton.click();
    await browser.wait(EC.visibilityOf(takeMeHomeButton), 60000);
    await takeMeHomeButton.click();

    await signInButton.click();
    await browser.wait(EC.invisibilityOf(signInButton), 60000);
    await browser.wait(EC.visibilityOf(ecoverseTitle), 60000);
  };
};

module.exports = new PageObjects();
