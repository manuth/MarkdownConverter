import { strictEqual } from "assert";
import { TempFile } from "@manuth/temp-files";
import { resolve } from "upath";
import { window, workspace } from "vscode";
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
                "Execute",
                () =>
                {
                    suite(
                        "Checking whether the `DestinationPattern` is substituted correctly…",
                        () =>
                        {
                            let testFile: TempFile;
                            let untitledSubstitutionTester: SubstitutionTester;

                            suiteSetup(
                                async () =>
                                {
                                    testFile = new TempFile(
                                        {
                                            Suffix: ".md"
                                        });

                                    untitledSubstitutionTester = new SubstitutionTester(await workspace.openTextDocument());
                                });

                            suiteTeardown(
                                async () =>
                                {
                                    testFile.Dispose();
                                });

                            test(
                                "Checking whether the user is prompted to specify the ${workspaceFolder}-path if the file is untitled and no workspace is opened…",
                                async function()
                                {
                                    this.slow(5 * 1000);
                                    this.timeout(10 * 1000);
                                    let inputWorkspaceName = "This is a workspace-folder for testing";
                                    let original = window.showInputBox;

                                    window.showInputBox = async () =>
                                    {
                                        return inputWorkspaceName;
                                    };

                                    context.Settings.DestinationPattern = "${workspaceFolder}";
                                    strictEqual(await untitledSubstitutionTester.Test(), resolve(inputWorkspaceName));
                                    context.Settings.DestinationPattern = "./Test";
                                    strictEqual(await untitledSubstitutionTester.Test(), resolve(inputWorkspaceName, context.Settings.DestinationPattern));
                                    window.showInputBox = original;
                                });
                        });
                });
        });
}
