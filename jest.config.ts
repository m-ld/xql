import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  projects: ["<rootDir>/packages/core", "<rootDir>/packages/observable"],
};

export default config;
