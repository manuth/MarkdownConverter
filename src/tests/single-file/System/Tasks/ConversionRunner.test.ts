import { ok, strictEqual } from "assert";
import { TempFile } from "@manuth/temp-files";
import { dirname } from "upath";
import { Uri, window, workspace } from "vscode";
import { ISettings } from "../../../../Properties/ISettings";
import { ITestContext } from "../../../ITestContext";
import { SubstitutionTester } from "../../../SubstitutionTester";

/**
 * Registers tests for the `ConversionRunner` class.
 *
 * @param context
 * The test-context.
 */
export function ConversionRunnerTests(context: ITestContext<ISettings>): void
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
                            let testFile: TempFile;
                            let substitutionTester: SubstitutionTester;
                            let untitledSubstitutionTester: SubstitutionTester;

                            suiteSetup(
                                async () =>
                                {
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
                                    testFile.Dispose();
                                });

                            test(
                                "Checking whether ${workspaceFolder} resolves to the folder containing the file…",
                                async function()
                                {
                                    this.slow(1 * 1000);
                                    this.timeout(4 * 1000);
                                    context.Settings.DestinationPattern = "${workspaceFolder}";
                                    strictEqual(Uri.file(await substitutionTester.Test()).fsPath, Uri.file(dirname(testFile.FullName)).fsPath);
                                });

                            test(
                                "Checking whether ${dirname} is empty…",
                                async function()
                                {
                                    this.slow(1 * 1000);
                                    this.timeout(4 * 1000);
                                    context.Settings.DestinationPattern = "${dirname}";
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

                                    context.Settings.DestinationPattern = "${workspaceFolder}";
                                    strictEqual(await untitledSubstitutionTester.Test(), inputWorkspaceName);
                                    window.showInputBox = original;
                                });
                        });
                });
        });
}
