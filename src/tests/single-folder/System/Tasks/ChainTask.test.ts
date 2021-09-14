import { doesNotReject, strictEqual } from "assert";
import { load } from "cheerio";
import MarkdownIt = require("markdown-it");
import anchor = require("markdown-it-anchor");
import { TextDocument, window } from "vscode";
import { extension } from "../../../..";
import { ChainTask } from "../../../../System/Tasks/ChainTask";
import { ConversionRunner } from "../../../../System/Tasks/ConversionRunner";

/**
 * Registers tests for the {@link ChainTask `ChainTask`} class.
 */
export function ChainTaskTests(): void
{
    suite(
        "ChainTask",
        () =>
        {
            let task: TestChainTask;

            /**
             * Provides an implementation of the {@link ChainTask `ChainTask`}-class for testing.
             */
            class TestChainTask extends ChainTask
            {
                /**
                 * @inheritdoc
                 */
                public override async ExecuteTask(): Promise<void>
                {
                    return super.ExecuteTask();
                }
            }

            suiteSetup(
                () =>
                {
                    task = new TestChainTask(extension);
                });

            suite(
                "ExecuteTask",
                () =>
                {
                    let showInputBox: typeof window.showInputBox;
                    let RenameTester: () => Promise<void>;
                    let TestRunner: () => Promise<TextDocument>;

                    suiteSetup(
                        () =>
                        {
                            let inputBoxResolver = (): void => { };
                            showInputBox = window.showInputBox;

                            window.showInputBox = async () =>
                            {
                                inputBoxResolver();
                                return "example";
                            };

                            TestRunner = async () =>
                            {
                                return new Promise<TextDocument>(
                                    (resolve) =>
                                    {
                                        let original = ConversionRunner.prototype.Execute;

                                        ConversionRunner.prototype.Execute = async (document) =>
                                        {
                                            ConversionRunner.prototype.Execute = original;
                                            resolve(document);
                                        };

                                        task.ExecuteTask();
                                    });
                            };

                            RenameTester = async () =>
                            {
                                let renameTask = new Promise<void>(
                                    (resolve) =>
                                    {
                                        inputBoxResolver = resolve;
                                    });

                                let testTask = TestRunner();
                                await Promise.all([renameTask, testTask]);
                            };
                        });

                    suiteTeardown(
                        () =>
                        {
                            window.showInputBox = showInputBox;
                        });

                    test(
                        "Checking whether the user is prompted to input a document-name…",
                        async function()
                        {
                            this.slow(7.5 * 1000);
                            this.timeout(15 * 1000);
                            await doesNotReject(() => RenameTester());
                        });

                    test(
                        "Checking whether all documents are being chained together…",
                        async function()
                        {
                            this.slow(10 * 1000);
                            this.timeout(20 * 1000);
                            let document: TextDocument;
                            await doesNotReject(
                                async () =>
                                {
                                    document = await TestRunner();
                                });

                            let result = load(new MarkdownIt().use(anchor).render(document.getText()));
                            strictEqual(result("#test-1").length, 1);
                            strictEqual(result("#test-2").length, 1);
                        });
                });
        });
}
