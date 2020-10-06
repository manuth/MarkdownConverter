import { doesNotThrow, throws } from "assert";
import { TempFile } from "@manuth/temp-files";
import { ConfigurationTarget, TextDocument, Uri, window, workspace, WorkspaceConfiguration } from "vscode";
import { extension } from "../../../../extension";
import { MarkdownFileNotFoundException } from "../../../../MarkdownFileNotFoundException";
import { Settings } from "../../../../Properties/Settings";
import { ConvertTask } from "../../../../System/Tasks/ConvertTask";
import { ConfigRestorer } from "../../../ConfigRestorer";

suite(
    "ConvertTask",
    () =>
    {
        suite(
            "GetMarkdownDocument()",
            () =>
            {
                let config: WorkspaceConfiguration;
                let configRestorer: ConfigRestorer;
                let testFile: TempFile;
                let task: TestConvertTask;

                /**
                 * Provides an implementation of the `ConvertTask` class for testing.
                 */
                class TestConvertTask extends ConvertTask
                {
                    /**
                     * @inheritdoc
                     *
                     * @returns
                     * The best matching markdown-document.
                     */
                    public GetMarkdownDocument(): TextDocument
                    {
                        return super.GetMarkdownDocument();
                    }
                }

                suiteSetup(
                    async () =>
                    {
                        config = workspace.getConfiguration(Settings.ConfigKey);

                        configRestorer = new ConfigRestorer(
                            [
                                "IgnoreLanguageMode"
                            ],
                            Settings.ConfigKey);

                        testFile = new TempFile(
                            {
                                Suffix: ".txt"
                            });

                        task = new TestConvertTask(extension);
                        await window.showTextDocument(Uri.file(testFile.FullName));
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
                        await config.update("IgnoreLanguageMode", false, ConfigurationTarget.Global);
                    });

                test(
                    "Checking whether an exception is thrown if no markdown-file is opened…",
                    () =>
                    {
                        throws(() => task.GetMarkdownDocument(), MarkdownFileNotFoundException);
                    });

                test(
                    "Checking whether no exception is thrown if `IgnoreLanguageMode` is enabled…",
                    async function()
                    {
                        this.slow(80);
                        await config.update("IgnoreLanguageMode", true, ConfigurationTarget.Global);
                        doesNotThrow(() => task.GetMarkdownDocument());
                    });
            });
    });
