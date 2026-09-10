// Separate Jest config for server/ unit tests. CRA's own test runner (yarn test,
// react-app-rewired test) hardcodes its roots to ./src, so server/ code is never
// picked up there - this config exists purely to run server-side tests, scoped to
// server/ only, with a plain Node environment instead of jsdom.
module.exports = {
    rootDir: __dirname,
    roots: ["<rootDir>/server"],
    testEnvironment: "node"
};
