import { ok, strictEqual } from "assert";
import { TempFile } from "@manuth/temp-files";
import { dirname } from "upath";
import { ConfigurationTarget, Uri, window, workspace, WorkspaceConfiguration } from "vscode";
import { Settings } from "../../../../Properties/Settings";
import { ConfigRestorer } from "../../../ConfigRestorer";
import { SubstitutionTester } from "../../../SubstitutionTester";

/**
 * Registers tests for the `ConversionRunner` class.
 */
export function ConversionRunnerTests(): void
{
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
                            let untitledSubstitutionTester: SubstitutionTester;

                            suiteSetup(
                                async () =>
                                {
                                    config = workspace.getConfiguration(Settings.ConfigKey);
                                    configRestorer = new ConfigRestorer(["DestinationPattern"], Settings.ConfigKey);

                                    testFile = new TempFile(
                                        {
                                            Suffix: ".md"
                                        });

                                    substitutionTester = new SubstitutionTester(await workspace.openTextDocument(testFile.FullName));
                                    untitledSubstitutionTester = new SubstitutionTester(await workspace.openTextDocument());
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
                                });

                            test(
                                "Checking whether ${workspaceFolder} resolves to the folder containing the file…",
                                async function()
                                {
                                    this.slow(1 * 1000);
                                    this.timeout(4 * 1000);
                                    await config.update("DestinationPattern", "${workspaceFolder}", ConfigurationTarget.Global);
                                    strictEqual(Uri.file(await substitutionTester.Test()).fsPath, Uri.file(dirname(testFile.FullName)).fsPath);
                                });

                            test(
                                "Checking whether ${dirname} is empty…",
                                async function()
                                {
                                    this.slow(1 * 1000);
                                    this.timeout(4 * 1000);
                                    await config.update("DestinationPattern", "${dirname}", ConfigurationTarget.Global);
                                    ok(/^\.?$/g.test(await substitutionTester.Test()));
                                });

                            test(
                                "Checking whether the user is prompted to specify the ${workspaceFolder}-path if the file is untitled and no workspace is opened…",
                                async function()
                                {
                                    this.slow(1 * 1000);
                                    // this.timeout(4 * 1000);
                                    this.timeout(0);
                                    let inputWorkspaceName = "This is a workspace-folder for testing";
                                    let original = window.showInputBox;

                                    window.showInputBox = async () =>
                                    {
                                        return inputWorkspaceName;
                                    };

                                    await config.update("DestinationPattern", "${workspaceFolder}", ConfigurationTarget.Global);
                                    strictEqual(await untitledSubstitutionTester.Test(), inputWorkspaceName);
                                    window.showInputBox = original;
                                });
                        });
                });
        });
}
