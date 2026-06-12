module.exports = {
  testEnvironment: 'node',
    //   weare testing backend [node] , not browser
  setupFilesAfterEnv : ["./test/setup.js"],
    // run setup.js before tests

  testMatch: ["**/test/**/*.test.js"],
//   only run files ending in test.js
// inside test folder

    testTimeout : 10000,
    // 10 second max per test
    // (db operations can be slow)
  
};
