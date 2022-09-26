import { doesNotThrow, ok, strictEqual } from "assert";
import { createRequire } from "module";
import { TempFile } from "@manuth/temp-files";
import { createSandbox, SinonSandbox } from "sinon";
import vscode, { Disposable, ExtensionContext, Progress, TextDocument } from "vscode";
import { Constants } from "../../Constants.js";
import { ConversionType } from "../../Conversion/ConversionType.js";
import { Converter } from "../../Conversion/Converter.js";
import { MarkdownConverterExtension } from "../../MarkdownConverterExtension.js";
import { ISettings } from "../../Properties/ISettings.js";
import { Resources } from "../../Properties/Resources.js";
import { Exception } from "../../System/Exception.js";
import { FileNotFoundException } from "../../System/IO/FileNotFoundException.js";
import { OperationCancelledException } from "../../System/OperationCancelledException.js";
import { ChromiumNotFoundException } from "../../System/Tasks/ChromiumNotFoundException.js";
import { ConvertAllTask } from "../../System/Tasks/ConvertAllTask.js";
import { ConvertTask } from "../../System/Tasks/ConvertTask.js";
import { IProgressState } from "../../System/Tasks/IProgressState.js";
import { PuppeteerTask } from "../../System/Tasks/PuppeteerTask.js";
import { ITestContext } from "../ITestContext.js";
import { TestConstants } from "../TestConstants.js";

const { commands, window, workspace } = createRequire(import.meta.url)("vscode") as typeof vscode;

/**
 * Registers tests for the {@link MarkdownConverterExtension `MarkdownConverterExtension`} class.
 *
 * @param context
 * The test-context.
 */
export function MarkdownConverterExtensionTests(context: ITestContext<ISettings>): void
{
    suite(
        nameof(MarkdownConverterExtension),
        () =>
        {
            let sandbox: SinonSandbox;
            let showFiles: boolean;
            let successMessageCount: number;
            let downloadChromium: boolean;
            let downloadRetryCount: number;
            let downloadCount: number;
            let customBrowserNotFoundCount: number;
            let extension: TestMarkdownConverterExtension;
            let task: PuppeteerTask;
            let tempFile: TempFile;
            let document: TextDocument;

            /**
             * Provides an implementation of the {@link MarkdownConverterExtension `MarkdownConverterExtension`} class for testing.
             */
            class TestMarkdownConverterExtension extends MarkdownConverterExtension
            {
                /**
                 * @inheritdoc
                 *
                 * @param task
                 * The task to execute.
                 */
                public override async ExecuteTaskInternal(task: PuppeteerTask): Promise<void>
                {
                    return super.ExecuteTaskInternal(task);
                }

                /**
                 * @inheritdoc
                 *
                 * @param reporter
                 * A component for reporting progress.
                 */
                public override async DownloadUpdate(reporter: Progress<IProgressState>): Promise<void>
                {
                    return super.DownloadUpdate(reporter);
                }
            }

            suiteSetup(
                () =>
                {
                    extension = new TestMarkdownConverterExtension(TestConstants.Extension.Context);
                });

            setup(
                async () =>
                {
                    sandbox = createSandbox();
                    context.Settings.ConversionType = [ConversionType[ConversionType.HTML] as keyof typeof ConversionType];
                    showFiles = false;
                    successMessageCount = 0;
                    downloadChromium = false;
                    downloadRetryCount = 0;
                    downloadCount = 0;
                    customBrowserNotFoundCount = 0;
                    sandbox.replace(Converter.prototype, "Start", async () => null);

                    /**
                     * Gets an answer representing the specified {@link value `value`}.
                     *
                     * @param value
                     * A value indicating whether a positive answer should be returned.
                     *
                     * @returns
                     * The corresponding answer.
                     */
                    function GetAnswer(value: boolean): string
                    {
                        return value ?
                            Resources.Resources.Get<string>("Yes") :
                            Resources.Resources.Get<string>("No");
                    }

                    sandbox.replace(
                        window,
                        "showWarningMessage",
                        async (message: string) =>
                        {
                            switch (message)
                            {
                                case Resources.Resources.Get("CustomBrowserNotFound"):
                                    customBrowserNotFoundCount++;
                                    return GetAnswer(false);
                                case Resources.Resources.Get("UpdateFailed"):
                                    return GetAnswer(downloadRetryCount-- > 0);
                                default:
                                    return GetAnswer(false);
                            }
                        });

                    sandbox.replace(
                        window,
                        "showInformationMessage",
                        async (message: string, ...items: any[]) =>
                        {
                            if (
                                items.length === 1 &&
                                items[0] === Resources.Resources.Get("OpenFileLabel"))
                            {
                                successMessageCount++;
                                return undefined;
                            }
                            else
                            {
                                switch (message)
                                {
                                    case Resources.Resources.Get("CollectionFinished"):
                                        return GetAnswer(showFiles);
                                    case Resources.Resources.Get("UpdateMessage"):
                                        return GetAnswer(downloadChromium);
                                    default:
                                        return GetAnswer(false);
                                }
                            }
                        });

                    sandbox.replace(
                        extension,
                        "DownloadUpdate",
                        async () =>
                        {
                            downloadCount++;

                            if (downloadRetryCount > 0)
                            {
                                throw new Error();
                            }
                        });

                    task = new class extends PuppeteerTask
                    {
                        /**
                         * @inheritdoc
                         */
                        public get Title(): string
                        {
                            return "Test";
                        }

                        /**
                         * @inheritdoc
                         */
                        protected async ExecuteTask(): Promise<void>
                        { }
                    }(extension);

                    tempFile = new TempFile(
                        {
                            Suffix: ".md"
                        });

                    document = await workspace.openTextDocument(tempFile.FullName);
                });

            teardown(
                () =>
                {
                    sandbox.restore();
                });

            suite(
                nameof(MarkdownConverterExtension.constructor),
                () =>
                {
                    test(
                        "Checking whether a new instance of the class can be initialized…",
                        () =>
                        {
                            doesNotThrow(() => new MarkdownConverterExtension(extension.Context));
                        });
                });

            suite(
                nameof<TestMarkdownConverterExtension>((extension) => extension.ChromiumRevision),
                () =>
                {
                    test(
                        "Checking whether a chromium-revision is returned…",
                        () =>
                        {
                            ok(typeof extension.ChromiumRevision === "string");
                        });
                });

            suite(
                nameof<TestMarkdownConverterExtension>((extension) => extension.Activate),
                () =>
                {
                    setup(
                        async () =>
                        {
                            let subscriptions: Disposable[] = [];

                            sandbox.replaceGetter(
                                extension,
                                "Context",
                                () =>
                                {
                                    return {
                                        subscriptions
                                    } as ExtensionContext;
                                });

                            sandbox.replace(commands, "registerCommand", () => new Object() as any);
                            await extension.Activate();
                        });

                    test(
                        "Checking whether the commands are registered…",
                        () =>
                        {
                            ok(extension.Context.subscriptions.length > 0);
                        });
                });

            suite(
                nameof<TestMarkdownConverterExtension>((extension) => extension.ExecuteTaskInternal),
                () =>
                {
                    test(
                        "Checking whether the user can choose whether or not to show all files if multiple files are converted…",
                        async function()
                        {
                            this.slow(10 * 1000);
                            this.timeout(20 * 1000);
                            let task = new ConvertAllTask(extension);
                            await extension.ExecuteTaskInternal(task);
                            strictEqual(successMessageCount, 0);
                            showFiles = true;
                            await extension.ExecuteTaskInternal(task);
                            ok(successMessageCount > 0);
                        });

                    test(
                        "Checking whether all converted files are reported, if a normal conversion-task is executed…",
                        async function()
                        {
                            this.slow(2 * 1000);
                            this.timeout(4 * 1000);
                            await window.showTextDocument(document);
                            await extension.ExecuteTaskInternal(new ConvertTask(extension));
                            strictEqual(successMessageCount, context.Settings.ConversionType.length);
                        });

                    test(
                        "Checking whether an error-message is displayed if the custom chromium path wasn't found…",
                        async () =>
                        {
                            await extension.ExecuteTaskInternal(task);
                            strictEqual(customBrowserNotFoundCount, 0);
                            context.Settings.ChromiumExecutablePath = tempFile.FullName;
                            await extension.ExecuteTaskInternal(task);
                            strictEqual(customBrowserNotFoundCount, 0);
                            context.Settings.ChromiumExecutablePath = "hello world";
                            await extension.ExecuteTaskInternal(task);
                            strictEqual(customBrowserNotFoundCount, 1);
                        });

                    test(
                        "Checking whether the user is asked to download chromium if it wasn't downloaded so far…",
                        async () =>
                        {
                            let task = new class extends PuppeteerTask
                            {
                                /**
                                 * @inheritdoc
                                 */
                                public get Title(): string
                                {
                                    return "Test";
                                }

                                /**
                                 * @inheritdoc
                                 */
                                public override async Execute(): Promise<void>
                                {
                                    if (downloadCount === 0)
                                    {
                                        throw new ChromiumNotFoundException();
                                    }
                                }

                                /**
                                 * @inheritdoc
                                 */
                                protected async ExecuteTask(): Promise<void>
                                { }
                            }(extension);

                            await extension.ExecuteTaskInternal(task);
                            strictEqual(downloadCount, 0);
                            downloadChromium = true;
                            await extension.ExecuteTaskInternal(task);
                            strictEqual(downloadCount, 1);
                        });

                    test(
                        "Checking whether the user is asked to retry the download if it failed…",
                        async () =>
                        {
                            let task = new class extends PuppeteerTask
                            {
                                /**
                                 * @inheritdoc
                                 */
                                public get Title(): string
                                {
                                    return "Test";
                                }

                                /**
                                 * @inheritdoc
                                 */
                                public override async Execute(): Promise<void>
                                {
                                    if (downloadCount === 0)
                                    {
                                        throw new ChromiumNotFoundException();
                                    }
                                }

                                /**
                                 * @inheritdoc
                                 */
                                protected async ExecuteTask(): Promise<void>
                                { }
                            }(extension);

                            sandbox.replace(Constants.Puppeteer, "executablePath", () => "Hello World");
                            downloadChromium = true;
                            downloadRetryCount = 2;
                            await extension.ExecuteTaskInternal(task);
                            ok(downloadCount > 1);
                        });

                    test(
                        "Checking whether an information-message is displayed if a cancellation was triggered…",
                        async () =>
                        {
                            let task = new class extends PuppeteerTask
                            {
                                /**
                                 * @inheritdoc
                                 */
                                public get Title(): string
                                {
                                    return "Test";
                                }

                                /**
                                 * @inheritdoc
                                 */
                                protected ExecuteTask(): Promise<void>
                                {
                                    throw new OperationCancelledException();
                                }
                            }(extension);

                            let spy = sandbox.mock(window).expects(nameof(window.showInformationMessage)).atLeast(0);
                            await extension.ExecuteTaskInternal(task);

                            ok(
                                spy.args.some(
                                    (args) =>
                                    {
                                        return args.length === 1 &&
                                            args[0] === new OperationCancelledException().Message;
                                    }));
                        });

                    test(
                        `Checking whether error-messages are displayed for all other kinds of \`${nameof(Exception)}\`s…`,
                        async () =>
                        {
                            let exception = new FileNotFoundException(tempFile.FullName);

                            let task = new class extends PuppeteerTask
                            {
                                /**
                                 * @inheritdoc
                                 */
                                public get Title(): string
                                {
                                    return "Test";
                                }

                                /**
                                 * @inheritdoc
                                 */
                                protected ExecuteTask(): Promise<void>
                                {
                                    throw exception;
                                }
                            }(extension);

                            let spy = sandbox.mock(window).expects(nameof(window.showErrorMessage)).atLeast(0);
                            await extension.ExecuteTaskInternal(task);

                            ok(
                                spy.args.some(
                                    (args) =>
                                    {
                                        return args.length === 1 &&
                                            args[0] === exception.Message;
                                    }));
                        });
                });
        });
}
