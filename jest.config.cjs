/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  transformIgnorePatterns: ["//node_modules"],
  globals: {
    'ts-jest': {
      diagnostics: {
        exclude: ['**'],
      },
    },
  }
};
