// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = function override(config) {
    // ⬇ Output a single file
    delete config.output.chunkFilename;
    delete config.optimization.runtimeChunk;
    delete config.optimization.splitChunks;

    // ⬇ Remove hash from filename
    config.output.filename = "static/js/[name].js";

    // config.plugins = [...config.plugins, new BundleAnalyzerPlugin()];

    return config;
};
