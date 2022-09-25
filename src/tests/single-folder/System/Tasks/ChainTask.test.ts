import { ok, strictEqual } from "assert";
import { parse } from "path";
import { load } from "cheerio";
import { pathExists, readFile, remove } from "fs-extra";
import { Random } from "random-js";
import { createSandbox, SinonExpectation, SinonSandbox } from "sinon";
import { CancellationToken, Progress, window } from "vscode";
import { ConversionType } from "../../../../Conversion/ConversionType";
import { IConvertedFile } from "../../../../Conversion/IConvertedFile";
import { ISettings } from "../../../../Properties/ISettings";
import { ChainTask } from "../../../../System/Tasks/ChainTask";
import { IProgressState } from "../../../../System/Tasks/IProgressState";
import { ITestContext } from "../../../ITestContext";
import { TestConstants } from "../../../TestConstants";

/**
 * Registers tests for the {@link ChainTask `ChainTask`} class.
 *
 * @param context
 * The text-context.
 */
export function ChainTaskTests(context: ITestContext<ISettings>): void
{
    suite(
        nameof(ChainTask),
        () =>
        {
            let random: Random;
            let sandbox: SinonSandbox;
            let converterSandbox: SinonSandbox;
            let documentName: string;
            let inputBoxExpectation: SinonExpectation;
            let task: TestChainTask;
            let files: IConvertedFile[];
            let fileReporter: Progress<IConvertedFile>;

            /**
             * Provides an implementation of the {@link ChainTask `ChainTask`}-class for testing.
             */
            class TestChainTask extends ChainTask
            {
                /**
                 * @inheritdoc
                 *
                 * @param progressReporter
                 * A component for reporting progress.
                 *
                 * @param cancellationToken
                 * A component for handling cancellation-requests.
                 *
                 * @param fileReporter
                 * A component for reporting converted files.
                 */
                public override async ExecuteTask(progressReporter?: Progress<IProgressState>, cancellationToken?: CancellationToken, fileReporter?: Progress<IConvertedFile>): Promise<void>
                {
                    return super.ExecuteTask(progressReporter, cancellationToken, fileReporter);
                }
            }

            suiteSetup(
                () =>
                {
                    random = new Random();
                    task = new TestChainTask(TestConstants.Extension);

                    fileReporter = {
                        report: (file) =>
                        {
                            files.push(file);
                        }
                    };
                });

            setup(
                () =>
                {
                    sandbox = createSandbox();
                    converterSandbox = createSandbox();
                    files = [];
                    documentName = random.string(10);
                    let mockedWindow = sandbox.mock(window);
                    inputBoxExpectation = mockedWindow.expects(nameof(window.showInputBox));
                    inputBoxExpectation.atLeast(0);
                    inputBoxExpectation.resolves(documentName);
                    converterSandbox.replace(task.ConversionRunner, "Execute", () => null);
                });

            teardown(
                async () =>
                {
                    sandbox.restore();
                    converterSandbox.restore();

                    for (let file of files)
                    {
                        await remove(file.FileName);
                    }
                });

            suite(
                nameof<TestChainTask>((task) => task.ExecuteTask),
                () =>
                {
                    setup(
                        () =>
                        {
                            context.Settings.ConversionType = [
                                ConversionType[ConversionType.HTML] as keyof typeof ConversionType
                            ];
                        });

                    test(
                        "Checking whether the user is prompted to input a document-name…",
                        async function()
                        {
                            this.slow(3 * 1000);
                            this.timeout(6 * 1000);
                            await task.ExecuteTask(null, null, fileReporter);
                            ok(inputBoxExpectation.calledOnce);
                        });

                    test(
                        "Checking whether the progress is reported…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            let reportCount = 0;
                            await task.ExecuteTask({ report: () => reportCount++ }, null, fileReporter);
                            ok(reportCount > 0);
                        });

                    test(
                        "Checking whether a file with the desired name is created…",
                        async function()
                        {
                            this.slow(30 * 1000);
                            this.timeout(15 * 1000);
                            let files: IConvertedFile[] = [];
                            converterSandbox.restore();

                            await task.ExecuteTask(
                                null,
                                null,
                                {
                                    report: (file) =>
                                    {
                                        fileReporter.report(file);
                                        files.push(file);
                                    }
                                });

                            strictEqual(files.length, 1);
                            strictEqual(files[0].Type, ConversionType.HTML);
                            strictEqual(parse(files[0].FileName).name, documentName);
                            ok(await pathExists(files[0].FileName));
                        });

                    test(
                        "Checking whether all documents are being chained together in the correct order…",
                        async function()
                        {
                            this.slow(10 * 1000);
                            this.timeout(20 * 1000);
                            let file: IConvertedFile;
                            converterSandbox.restore();

                            await task.ExecuteTask(
                                null,
                                null,
                                {
                                    report: (convertedFile) =>
                                    {
                                        fileReporter.report(convertedFile);
                                        file = convertedFile;
                                    }
                                });

                            let firstSelector = "#test-1";
                            let secondSelector = "#test-2";
                            let result = load((await readFile(file.FileName)).toString());
                            strictEqual(result(firstSelector).length, 1);
                            strictEqual(result(secondSelector).length, 1);
                            ok(result(firstSelector).index() < result(secondSelector).index());
                        });
                });
        });
}
