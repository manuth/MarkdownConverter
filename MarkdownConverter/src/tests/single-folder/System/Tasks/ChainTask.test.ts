import Assert = require("assert");
import Cheerio = require("cheerio");
import MarkdownIt = require("markdown-it");
import anchor = require("markdown-it-anchor");
import { TextDocument, window } from "vscode";
import { extension } from "../../../../extension";
import { ChainTask } from "../../../../System/Tasks/ChainTask";
import { ConversionRunner } from "../../../../System/Tasks/ConversionRunner";

suite(
    "ChainTask",
    () =>
    {
        let task: ChainTask;

        suiteSetup(
            () =>
            {
                task = new ChainTask(extension);
            });

        suite(
            "ExecuteTask",
            () =>
            {
                let showInputBox = window["showInputBox"];
                let RenameTester: () => Promise<void>;
                let TestRunner: () => Promise<TextDocument>;

                suiteSetup(
                    () =>
                    {
                        let inputBoxResolver = () => { };
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

                                    task.Execute();
                                });
                        };

                        RenameTester = async () =>
                        {
                            let renameTask = new Promise(
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
                        this.enableTimeouts(false);
                        await Assert.doesNotReject(() => RenameTester());
                    });

                test(
                    "Checking whether all documents are being chained together…",
                    async function()
                    {
                        this.enableTimeouts(false);
                        let document: TextDocument;
                        await Assert.doesNotReject(
                            async () =>
                            {
                                document = await TestRunner();
                            });

                        let result = Cheerio.load(new MarkdownIt().use(anchor).render(document.getText()));
                        Assert.strictEqual(result("#test-1").length, 1);
                        Assert.strictEqual(result("#test-2").length, 1);
                    });
            });
    });