import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        baseUrl: "http://localhost:3000",
        retries: 0,
        pluginsFile: "cypress/plugins/index.ts",
        supportFile: "cypress/support/index.ts",
        downloadsFolder: "cypress/downloads",
        trashAssetsBeforeRuns: true,
        responseTimeout: 100000
    }
});