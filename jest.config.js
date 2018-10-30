module.exports = {
    transform: {
      '^.+\\.(t|j)sx?$': 'ts-jest'
    },
    testRegex: "tests/.*\\.(ts|tsx|js)$",
    moduleFileExtensions: [
      'ts',
      'tsx',
      'js'
    ],
    verbose: true,
    globals: {
      'ts-jest': {
        tsConfigFile: 'tsconfig.test.json',
        enableTsDiagnostics: true,
        skipBabel: true
      },
      __VERSION__: '1.0.0-test',
      __LICENSE__: 'Test-licence',
      __BUILD_ID__: 0,
      __DEBUG__: true,
      __TEST__: true,
      __PRODUCTION__: false,
      __APP_CONTEXT__: '/'
    }
  };