module.exports = {
  assetsDir: "static",
  publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
  pluginOptions: {
    electronBuilder: {
      builderOptions: {},
    },
  },
};
