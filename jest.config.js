module.exports = {
  rootDir: "src",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(j|t)sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css)$": "identity-obj-proxy",
    "\\.(bmp|gif|jpe?g|png|svg|webp)$": "<rootDir>/test/fileMock.js",
    "single-spa-react/parcel": "single-spa-react/lib/cjs/parcel.cjs",
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
};
