import { ConfigurationTarget, workspace, WorkspaceConfiguration } from "vscode";
import { Settings } from "../Properties/Settings";
import { ConfigRestorer } from "../tests/ConfigRestorer";

suite(
    "Common Tests",
    () =>
    {
        let config: WorkspaceConfiguration;
        let configRestorer: ConfigRestorer;

        suiteSetup(
            async function()
            {
                this.enableTimeouts(false);
                config = workspace.getConfiguration(Settings["configKey"]);
                configRestorer = new ConfigRestorer(
                    [
                        "Parser.SystemParserEnabled"
                    ],
                    Settings["configKey"]);

                await configRestorer.Clear();
                await config.update("Parser.SystemParserEnabled", false, ConfigurationTarget.Global);
            });

        suiteTeardown(
            async () =>
            {
                await configRestorer.Restore();
            });

        require("../tests/common/main.test");
    });