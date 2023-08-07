const FileManagerPlugin = require('filemanager-webpack-plugin');

const OUTPUT_FILENAME = "webchat.min.js"
const DIST_CDN_DIR = "dist/cdn"

module.exports = function override(config) {
    // ⬇ Output a single file
    delete config.output.chunkFilename;
    delete config.optimization.runtimeChunk;
    delete config.optimization.splitChunks;

    // ⬇ Remove hash from filename
    config.output.filename = `static/js/${OUTPUT_FILENAME}`;

    // ⬇ Prevent (missing) node fallback on path module
    config.resolve.fallback = { ...(config.resolve.fallback || {}), path: false };

    config.plugins = [
        ...config.plugins,
        new FileManagerPlugin({
              events: {
                  onEnd: {
                      copy: [{ source: `build/static/js/${OUTPUT_FILENAME}`, destination: `${DIST_CDN_DIR}/${OUTPUT_FILENAME}` }]
                  }
              }
        })
    ];
    return config;
};
