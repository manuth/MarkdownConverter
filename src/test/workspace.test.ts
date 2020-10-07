import { ConfigurationTarget, workspace, WorkspaceConfiguration } from "vscode";
import { Settings } from "../Properties/Settings";
import { ConfigRestorer } from "../tests/ConfigRestorer";
import { WorkspaceTests } from "../tests/workspace";

suite(
    "Test for Visual Studio Code in Workspace Mode",
    () =>
    {
        let config: WorkspaceConfiguration;
        let configRestorer: ConfigRestorer;

        suiteSetup(
            async function()
            {
                this.slow(2 * 1000);
                this.timeout(8 * 1000);
                config = workspace.getConfiguration(Settings.ConfigKey);

                configRestorer = new ConfigRestorer(
                    [
                        "Parser.SystemParserEnabled"
                    ],
                    Settings.ConfigKey);

                await configRestorer.Clear();
                await config.update("Parser.SystemParserEnabled", false, ConfigurationTarget.Global);
            });

        suiteTeardown(
            async () =>
            {
                await configRestorer.Restore();
            });

        WorkspaceTests();
    });
