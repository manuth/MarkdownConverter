import Assert = require("assert");
import Path = require("path");
import { TempFile } from "temp-filesystem";
import { ConfigurationTarget, Uri, workspace, WorkspaceConfiguration } from "vscode";
import { Settings } from "../../../../Properties/Settings";
import { ConfigRestorer } from "../../../ConfigRestorer";
import { SubstitutionTester } from "../../../SubstitutionTester";

suite(
    "ConversionRunner",
    () =>
    {
        suite(
            "Execute(TextDocument document, Progress<IProgressState> progressReporter?, Progress<IConvertedFile> fileReporter?)",
            () =>
            {
                suite(
                    "Checking whether the `DestinationPattern` is substituted correctly…",
                    () =>
                    {
                        let config: WorkspaceConfiguration;
                        let configRestorer: ConfigRestorer;
                        let testFile: TempFile;
                        let substitutionTester: SubstitutionTester;

                        suiteSetup(
                            async function()
                            {
                                this.enableTimeouts(false);
                                config = workspace.getConfiguration(Settings["configKey"]);
                                configRestorer = new ConfigRestorer(["DestinationPattern", "Parser.SystemParserEnabled"], Settings["configKey"]);
                                testFile = new TempFile(
                                    {
                                        postfix: ".md"
                                    });

                                substitutionTester = new SubstitutionTester(await workspace.openTextDocument(testFile.FullName));
                            });

                        suiteTeardown(
                            async () =>
                            {
                                await configRestorer.Restore();
                                testFile.Dispose();
                            });

                        setup(
                            async () =>
                            {
                                await configRestorer.Clear();
                                await config.update("Parser.SystemParserEnabled", false, ConfigurationTarget.Global);
                            });

                        test(
                            "Checking whether ${workspaceFolder} resolves to the folder containing the file…",
                            async () =>
                            {
                                await config.update("DestinationPattern", "${workspaceFolder}", ConfigurationTarget.Global);
                                Assert.strictEqual(Uri.file(await substitutionTester.Test()).fsPath, Uri.file(Path.dirname(testFile.FullName)).fsPath);
                            });

                        test(
                            "Checking whether ${dirname} is empty…",
                            async () =>
                            {
                                await config.update("DestinationPattern", "${dirname}", ConfigurationTarget.Global);
                                Assert(/^\.?$/g.test(await substitutionTester.Test()));
                            });
                    });
            });
    });