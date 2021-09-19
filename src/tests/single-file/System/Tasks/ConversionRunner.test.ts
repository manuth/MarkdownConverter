import { strictEqual } from "assert";
import { dirname } from "path";
import { TempFile } from "@manuth/temp-files";
import { createSandbox, SinonSandbox } from "sinon";
import { resolve } from "upath";
import { TextDocument, Uri, window, workspace } from "vscode";
import { ConversionType } from "../../../../Conversion/ConversionType";
import { ISettings } from "../../../../Properties/ISettings";
import { Settings } from "../../../../Properties/Settings";
import { ConversionRunner } from "../../../../System/Tasks/ConversionRunner";
import { ITestContext } from "../../../ITestContext";
import { SubstitutionTester } from "../../../SubstitutionTester";
import { TestConstants } from "../../../TestConstants";
import { TestConversionRunner } from "../../../TestConversionRunner";

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
            let conversionRunner: TestConversionRunner;
            let tempFile: TempFile;
            let document: TextDocument;
            let untitledDocument: TextDocument;
            let workspaceFolderPattern = "${workspaceFolder}";

            suiteSetup(
                async () =>
                {
                    conversionRunner = new TestConversionRunner(TestConstants.Extension);

                    tempFile = new TempFile(
                        {
                            Suffix: ".md"
                        });

                    document = await workspace.openTextDocument(tempFile.FullName);
                    untitledDocument = await workspace.openTextDocument();
                });

            suite(
                nameof<TestConversionRunner>((runner) => runner.Execute),
                () =>
                {
                    suite(
                        `Checking whether the \`${nameof<Settings>((s) => s.DestinationPattern)}\` is substituted correctly…`,
                        () =>
                        {
                            let sandbox: SinonSandbox;
                            let substitutionTester: SubstitutionTester;

                            suiteSetup(
                                async () =>
                                {
                                    substitutionTester = new SubstitutionTester(conversionRunner);
                                });

                            suiteTeardown(
                                async () =>
                                {
                                    tempFile.Dispose();
                                });

                            setup(
                                () =>
                                {
                                    sandbox = createSandbox();

                                    context.Settings.ConversionType = [
                                        nameof(ConversionType.PDF)
                                    ] as Array<keyof typeof ConversionType>;
                                });

                            teardown(
                                () =>
                                {
                                    sandbox.restore();
                                });

                            test(
                                `Checking whether the user is prompted to specify the \`${workspaceFolderPattern}\`-path if the file is untitled and no workspace is opened…`,
                                async function()
                                {
                                    this.slow(5 * 1000);
                                    this.timeout(10 * 1000);
                                    let inputWorkspaceName = "This is a workspace-folder for testing";
                                    sandbox.replace(window, "showInputBox", async () => inputWorkspaceName);
                                    strictEqual(await substitutionTester.Test(untitledDocument, workspaceFolderPattern), resolve(inputWorkspaceName));
                                    let pattern = "./Test";
                                    strictEqual(await substitutionTester.Test(untitledDocument, pattern), resolve(inputWorkspaceName, pattern));
                                });

                            test(
                                `Checking whether the \`${workspaceFolderPattern}\` is replaced with the name of the directory containing the file…`,
                                async function()
                                {
                                    this.slow(2 * 1000);
                                    this.timeout(4 * 1000);

                                    strictEqual(
                                        Uri.file(await substitutionTester.Test(document, workspaceFolderPattern)).fsPath,
                                        Uri.file(dirname(tempFile.FullName)).fsPath);
                                });
                        });
                });

            suite(
                nameof<TestConversionRunner>((runner) => runner.GetWorkspacePath),
                () =>
                {
                    test(
                        "Checking whether the directory containing the document is returned if no workspace-folder is opened…",
                        async () =>
                        {
                            strictEqual(
                                Uri.file(conversionRunner.GetWorkspacePath(document)).fsPath,
                                Uri.file(dirname(tempFile.FullName)).fsPath);
                        });

                    test(
                        `Checking whether \`${null}\` is returned, if the document is untitled and no workspace-folder is opened…`,
                        async () =>
                        {
                            strictEqual(conversionRunner.GetWorkspacePath(untitledDocument), null);
                        });
                });
        });
}
