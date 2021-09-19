import { strictEqual } from "assert";
import { dirname, normalize } from "path";
import { TempFile } from "@manuth/temp-files";
import { TextDocument, Uri, workspace } from "vscode";
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
            let conversionRunner: TestConversionRunner;
            let tempFile: TempFile;
            let document: TextDocument;
            let untitledDocument: TextDocument;

            suiteSetup(
                async () =>
                {
                    conversionRunner = new TestConversionRunner(TestConstants.Extension);
                    untitledDocument = await workspace.openTextDocument({});
                });

            setup(
                async () =>
                {
                    tempFile = new TempFile();
                    document = await workspace.openTextDocument(tempFile.FullName);
                });

            teardown(
                () =>
                {
                    tempFile.Dispose();
                });

            suite(
                nameof<TestConversionRunner>((runner) => runner.GetWorkspacePath),
                () =>
                {
                    test(
                        "Checking whether the the path to the workspace-folder containing the file is returned…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);

                            for (let uri of await workspace.findFiles("**/*"))
                            {
                                let document = await workspace.openTextDocument(uri);

                                strictEqual(
                                    conversionRunner.GetWorkspacePath(document),
                                    workspace.getWorkspaceFolder(uri).uri.fsPath);
                            }
                        });

                    test(
                        `Checking whether \`${null}\` is returned, if the document is untitled and multiple workspace-folders are opened…`,
                        () =>
                        {
                            strictEqual(conversionRunner.GetWorkspacePath(untitledDocument), null);
                        });

                    test(
                        "Checking whether the path to the directory containing the document is returned if the document doesn't belong to any workspace-folder…",
                        () =>
                        {
                            strictEqual(
                                normalize(conversionRunner.GetWorkspacePath(document)),
                                normalize(Uri.file(dirname(tempFile.FullName)).fsPath));
                        });
                });
        });
}
