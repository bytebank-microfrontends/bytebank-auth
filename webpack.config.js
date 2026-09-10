const path = require("path");
const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "bytebank",
    projectName: "auth",
    webpackConfigEnv,
    argv,
    outputSystemJS: false,
  });

  if (!webpackConfigEnv.standalone) {
    defaultConfig.externals.push(
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@bytebank/util"
    );
  } else {
    defaultConfig.resolve = defaultConfig.resolve || {};
    defaultConfig.resolve.alias = {
      ...(defaultConfig.resolve.alias || {}),
      "@bytebank/util$": path.resolve(
        __dirname,
        "src/standalone/bytebank-util.ts"
      ),
    };
  }

  return merge(defaultConfig, {
    // modify the webpack config however you'd like to by adding to this object
  });
};
