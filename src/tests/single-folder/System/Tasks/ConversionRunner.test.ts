import { strictEqual } from "node:assert";
import { createRequire } from "node:module";
import vscode, { TextDocument } from "vscode";
import { Constants } from "../../../../Constants.js";
import { ConversionRunner } from "../../../../System/Tasks/ConversionRunner.js";
import { TestConstants } from "../../../TestConstants.js";
import { TestConversionRunner } from "../../../TestConversionRunner.js";

const { workspace } = createRequire(Constants.PackageURL)("vscode") as typeof vscode;

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
