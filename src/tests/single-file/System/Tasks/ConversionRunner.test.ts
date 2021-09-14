import { strictEqual } from "assert";
import { TempFile } from "@manuth/temp-files";
import { resolve } from "upath";
import { window, workspace } from "vscode";
import { ConversionType } from "../../../../Conversion/ConversionType";
import { ISettings } from "../../../../Properties/ISettings";
import { Settings } from "../../../../Properties/Settings";
import { ConversionRunner } from "../../../../System/Tasks/ConversionRunner";
import { ITestContext } from "../../../ITestContext";
import { SubstitutionTester } from "../../../SubstitutionTester";

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

                                    context.Settings.DestinationPattern = workspaceFolderPattern;
                                    strictEqual(await untitledSubstitutionTester.Test(), resolve(inputWorkspaceName));
                                    context.Settings.DestinationPattern = "./Test";
                                    strictEqual(await untitledSubstitutionTester.Test(), resolve(inputWorkspaceName, context.Settings.DestinationPattern));
                                    window.showInputBox = original;
                                });
                        });
                });
        });
}
