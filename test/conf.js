// conf.js
exports.config = {
  framework: 'jasmine',
  directConnect: true, // enabled, when used without webdriver-manager
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['simple-test.js'],
  directConnect: true,
  capabilities: {
    browserName: 'firefox',
    'moz:firefoxOptions': {
      args: ['--safe-mode'],
    },
  },

  params: {
    login: {
      url:
        'https://login.microsoftonline.com/22e3aada-5a09-4e2b-9e0e-dc4f02328b29/oauth2/v2.0/authorize?client_id=6f4fcdb2-5792-4e17-bbdc-14ac0cf78496&scope=openid%20profile%20offline_access&redirect_uri=https%3A%2F%2Fdev.cherrytwist.org%2Flogin&client-request-id=ad17f83e-e49c-4a06-be8c-c59f800b2410&response_mode=fragment&response_type=code&x-client-SKU=msal.js.browser&x-client-VER=2.9.0&x-client-OS=&x-client-CPU=&client_info=1&code_challenge=xSV2NcP3-qE0J0-rzPqBVgMOatMMbVg6I2wFQ-q0Bbo&code_challenge_method=S256&nonce=0c5eabab-69f7-4899-a5ba-b3e8ed744188&state=eyJpZCI6IjliZDA3NjFhLTlkY2EtNGI5Yi1hM2MxLTIzMzdlMDYxNTFjNSIsInRzIjoxNjEzNTE2ODc3LCJtZXRhIjp7ImludGVyYWN0aW9uVHlwZSI6InBvcHVwIn19',
      email: 'admin@devcherrytwist.onmicrosoft.com',
      password: '',
    },
  },
};
