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
    defaultConfig.externals.push("react/jsx-runtime", "react/jsx-dev-runtime");
  }

  return merge(defaultConfig, {
    // modify the webpack config however you'd like to by adding to this object
  });
};
