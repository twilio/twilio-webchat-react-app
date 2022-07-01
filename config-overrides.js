// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = function override(config) {
    // ⬇ Output a single file
    delete config.output.chunkFilename;
    delete config.optimization.runtimeChunk;
    delete config.optimization.splitChunks;

    // ⬇ Remove hash from filename
    config.output.filename = "static/js/[name].js";

    // ⬇ Prevent (missing) node fallback on path module
    config.resolve.fallback = { ...(config.resolve.fallback || {}), "path": false }

    // config.plugins = [...config.plugins, new BundleAnalyzerPlugin()];

    return config;
};
