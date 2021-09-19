import { strictEqual } from "assert";
import { TextDocument, workspace } from "vscode";
import { ConversionRunner } from "../../../../System/Tasks/ConversionRunner";
import { TestConstants } from "../../../TestConstants";
import { TestConversionRunner } from "../../../TestConversionRunner";

/**
 * Registers tests for the {@link ConversionRunner `ConversionRunner`} class.
 */
export function ConversionRunnerTests(): void
{
    suite(
        nameof(ConversionRunner),
        () =>
        {
            let document: TextDocument;
            let conversionRunner: TestConversionRunner;

            suiteSetup(
                () =>
                {
                    conversionRunner = new TestConversionRunner(TestConstants.Extension);
                });

            setup(
                async () =>
                {
                    document = await workspace.openTextDocument({});
                });

            suite(
                nameof<TestConversionRunner>((runner) => runner.GetWorkspacePath),
                () =>
                {
                    test(
                        "Checking whether the current workspace is returned if the file is untitled and only one workspace-folder is opened…",
                        () =>
                        {
                            strictEqual(conversionRunner.GetWorkspacePath(document), workspace.workspaceFolders[0].uri.fsPath);
                        });
                });
        });
}
