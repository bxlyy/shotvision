require("dotenv").config({ path: ".env.local" });

module.exports = {
  default: {
    requireModule: ["ts-node/register"], // Allow TypeScript
    require: ["features/steps/*.ts", "features/support/*.ts"], // Load steps and hooks
    format: ["progress-bar", "html:cucumber-report.html"], // Output format
  },
};
