import { strictEqual } from "assert";
import { TempFile } from "@manuth/temp-files";
import { resolve } from "upath";
import { TextDocument, window, workspace } from "vscode";
import { ConversionType } from "../../../../Conversion/ConversionType";
import { ISettings } from "../../../../Properties/ISettings";
import { Settings } from "../../../../Properties/Settings";
import { ConversionRunner } from "../../../../System/Tasks/ConversionRunner";
import { ITestContext } from "../../../ITestContext";
import { SubstitutionTester } from "../../../SubstitutionTester";
import { TestConstants } from "../../../TestConstants";

/**
 * Registers tests for the {@link ConversionRunner `ConversionRunner`} class.
 *
 * @param context
 * The test-context.
 */
export function ConversionRunnerTests(context: ITestContext<ISettings>): void
{
    suite(
        nameof(ConversionRunner),
        () =>
        {
            let workspaceFolderPattern = "${workspaceFolder}";

            suite(
                nameof<ConversionRunner>((runner) => runner.Execute),
                () =>
                {
                    suite(
                        `Checking whether the \`${nameof<Settings>((s) => s.DestinationPattern)}\` is substituted correctly…`,
                        () =>
                        {
                            let testFile: TempFile;
                            let untitledDocument: TextDocument;
                            let substitutionTester: SubstitutionTester;

                            suiteSetup(
                                async () =>
                                {
                                    testFile = new TempFile(
                                        {
                                            Suffix: ".md"
                                        });

                                    untitledDocument = await workspace.openTextDocument();
                                    substitutionTester = new SubstitutionTester(new ConversionRunner(TestConstants.Extension));
                                });

                            suiteTeardown(
                                async () =>
                                {
                                    testFile.Dispose();
                                });

                            setup(
                                () =>
                                {
                                    context.Settings.ConversionType = [
                                        nameof(ConversionType.PDF)
                                    ] as Array<keyof typeof ConversionType>;
                                });

                            test(
                                `Checking whether the user is prompted to specify the \`${workspaceFolderPattern}\`-path if the file is untitled and no workspace is opened…`,
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

                                    strictEqual(await substitutionTester.Test(untitledDocument, workspaceFolderPattern), resolve(inputWorkspaceName));
                                    let pattern = "./Test";
                                    strictEqual(await substitutionTester.Test(untitledDocument, pattern), resolve(inputWorkspaceName, pattern));
                                    window.showInputBox = original;
                                });
                        });
                });
        });
}
