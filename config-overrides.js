const FileManagerPlugin = require('filemanager-webpack-plugin');

const filename = "webchat-v3.min.js"
const cdnDirname = "cdn"

module.exports = function override(config) {
    // ⬇ Output a single file
    delete config.output.chunkFilename;
    delete config.optimization.runtimeChunk;
    delete config.optimization.splitChunks;

    // ⬇ Remove hash from filename
    config.output.filename = `static/js/${filename}`;

    // ⬇ Prevent (missing) node fallback on path module
    config.resolve.fallback = { ...(config.resolve.fallback || {}), path: false };

    config.plugins = [
        ...config.plugins,
        new FileManagerPlugin({
              events: {
                  onEnd: {
                      copy: [{ source: `build/static/js/${filename}`, destination: `dist/${cdnDirname}/${filename}` }]
                  }
              }
        })
    ];
    return config;
};
