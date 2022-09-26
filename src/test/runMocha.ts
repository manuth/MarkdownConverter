import { fork } from "node:child_process";
import { createRequire } from "node:module";
import { ConfigStore } from "./ConfigStore.js";
import { SuiteSet } from "./SuiteSet.js";
import { SuiteVarName } from "./SuiteVarName.js";

(
    async () =>
    {
        let options = ConfigStore.Get((process.env[SuiteVarName] as SuiteSet) ?? SuiteSet.Common);

        fork(
            createRequire(import.meta.url).resolve("mocha-explorer-launcher-scripts/vscode-test"),
            [
                ...process.argv.slice(2)
            ],
            {
                execArgv: process.execArgv,
                env: {
                    VSCODE_LAUNCH_ARGS: JSON.stringify(options.launchArgs),
                    VSCODE_VERSION: process.env["VSCODE_VERSION"],
                    ...options.extensionTestsEnv,
                    VSCODE_WORKSPACE_PATH: Array.isArray(options.extensionDevelopmentPath) ?
                        JSON.stringify(options.extensionDevelopmentPath) :
                        options.extensionDevelopmentPath,
                    MOCHA_WORKER_PATH: process.env["MOCHA_WORKER_PATH"]
                },
                stdio: "inherit"
            });
    })();
