import { fork } from "child_process";
import { ConfigStore } from "./ConfigStore";
import { SuiteSet } from "./SuiteSet";
import { SuiteVarName } from "./SuiteVarName";

(
    async () =>
    {
        let options = ConfigStore.Get((process.env[SuiteVarName] as SuiteSet) ?? SuiteSet.Common);

        fork(
            require.resolve("mocha-explorer-launcher-scripts/vscode-test"),
            [
                ...process.argv.slice(2)
            ],
            {
                execArgv: process.execArgv,
                env: {
                    VSCODE_LAUNCH_ARGS: JSON.stringify(options.launchArgs),
                    VSCODE_VERSION: process.env["VSCODE_VERSION"],
                    ...options.extensionTestsEnv,
                    VSCODE_WORKSPACE_PATH: process.env["VSCODE_WORKSPACE_PATH"],
                    MOCHA_WORKER_PATH: process.env["MOCHA_WORKER_PATH"]
                },
                stdio: "inherit"
            });
    })();
