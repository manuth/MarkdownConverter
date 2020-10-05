import ChildProcess = require("child_process");
import Path = require("path");
import FileSystem = require("fs-extra");
import Puppeteer = require("puppeteer-core");
import { PUPPETEER_REVISIONS } from "puppeteer-core/lib/cjs/puppeteer/revisions";
import Format = require("string-template");
import { commands, ExtensionContext, Progress, ProgressLocation, window } from "vscode";
import { Constants } from "./Constants";
import { ConversionType } from "./Conversion/ConversionType";
import { IConvertedFile } from "./Conversion/IConvertedFile";
import { MarkdownFileNotFoundException } from "./MarkdownFileNotFoundException";
import { Resources } from "./Properties/Resources";
import { Extension } from "./System/Extensibility/Extension";
import { FileException } from "./System/IO/FileException";
import { NoWorkspaceFolderException } from "./System/NoWorkspaceFolderException";
import { ChainTask } from "./System/Tasks/ChainTask";
import { ChromiumNotFoundException } from "./System/Tasks/ChromiumNotFoundException";
import { ConvertAllTask } from "./System/Tasks/ConvertAllTask";
import { ConvertTask } from "./System/Tasks/ConvertTask";
import { PuppeteerTask } from "./System/Tasks/PuppeteerTask";
import { YAMLException } from "./System/YAML/YAMLException";

/**
 * Represents the `Markdown Converter` extension.
 */
export class MarkdownConverterExtension extends Extension
{
    /**
     * Provides the functionality to report converted files.
     */
    private fileReporter: Progress<IConvertedFile>;

    /**
     * Initializes a new instance of the `MarkdownConverterExtension` class.
     */
    public constructor()
    {
        super(Constants.PackageDirectory);
        this.fileReporter = {
            async report(file)
            {
                let result = await (window.showInformationMessage(
                    Format(Resources.Resources.Get("SuccessMessage"), ConversionType[file.Type], file.FileName),
                    Resources.Resources.Get("OpenFileLabel")));

                if (result === Resources.Resources.Get("OpenFileLabel"))
                {
                    switch (process.platform)
                    {
                        case "win32":
                            ChildProcess.exec(`"${file.FileName}"`);
                            break;
                        case "darwin":
                            ChildProcess.exec(`bash -c 'open "${file.FileName}"'`);
                            break;
                        case "linux":
                            ChildProcess.exec(`bash -c 'xdg-open "${file.FileName}"'`);
                            break;
                        default:
                            window.showWarningMessage(Resources.Resources.Get("UnsupportedPlatformException"));
                            break;
                    }
                }
            }
        };
    }

    /**
     * Gets the chromium-revision of the extension.
     */
    public get ChromiumRevision(): string
    {
        return PUPPETEER_REVISIONS.chromium;
    }

    /**
     * @inheritdoc
     *
     * @param context
     * A collection of utilities private to an extension.
     *
     * @returns
     * The extension-body.
     */
    public async Activate(context: ExtensionContext): Promise<unknown>
    {
        context.subscriptions.push(
            commands.registerCommand("markdownConverter.Convert", async () => this.ExecuteTask(new ConvertTask(this))),
            commands.registerCommand("markdownConverter.ConvertAll", async () => this.ExecuteTask(new ConvertAllTask(this))),
            commands.registerCommand("markdownConverter.Chain", async () => this.ExecuteTask(new ChainTask(this))));

        return super.Active(context);
    }

    /**
     * @inheritdoc
     *
     * @param task
     * The task to execute.
     */
    protected async ExecuteTaskInternal(task: PuppeteerTask): Promise<void>
    {
        try
        {
            let run = async (fileReporter: Progress<IConvertedFile>): Promise<void> =>
            {
                await window.withProgress(
                    {
                        cancellable: task.Cancellable,
                        location: ProgressLocation.Notification,
                        title: task.Title
                    },
                    async (progressReporter, cancellationToken) =>
                    {
                        await task.Execute(progressReporter, cancellationToken, fileReporter);
                    });
            };

            if (task instanceof ConvertAllTask &&
                !(task instanceof ChainTask))
            {
                let files: IConvertedFile[] = [];

                await run(
                    {
                        report(file)
                        {
                            files.push(file);
                        }
                    });

                (async () =>
                {
                    if (
                        await (window.showInformationMessage(
                            Resources.Resources.Get("CollectionFinished"),
                            Resources.Resources.Get("Yes"),
                            Resources.Resources.Get("No"))) === Resources.Resources.Get<string>("Yes"))
                    {
                        for (let file of files)
                        {
                            this.fileReporter.report(file);
                        }
                    }
                })();
            }
            else
            {
                await run(this.fileReporter);
            }
        }
        catch (exception)
        {
            if (exception instanceof ChromiumNotFoundException)
            {
                if (
                    await (window.showInformationMessage(
                        Resources.Resources.Get("UpdateMessage"),
                        Resources.Resources.Get("Yes"),
                        Resources.Resources.Get("No"))) === Resources.Resources.Get<string>("Yes"))
                {
                    let revision = this.ChromiumRevision;
                    let success = false;
                    let puppeteerPath = Path.resolve(Constants.PackageDirectory, "node_modules", "puppeteer-core");

                    if (!await FileSystem.pathExists(puppeteerPath))
                    {
                        await FileSystem.mkdirp(puppeteerPath);
                    }

                    do
                    {
                        await (window.withProgress(
                            {
                                location: ProgressLocation.Notification,
                                title: Format(Resources.Resources.Get("UpdateRunning"), revision)
                            },
                            async (reporter) =>
                            {
                                try
                                {
                                    let progress = 0;
                                    let browserFetcher = Puppeteer.createBrowserFetcher();

                                    await browserFetcher.download(
                                        revision,
                                        (downloadBytes, totalBytes) =>
                                        {
                                            let newProgress = Math.floor((downloadBytes / totalBytes) * 100);

                                            if (newProgress > progress)
                                            {
                                                reporter.report(
                                                    {
                                                        increment: newProgress - progress
                                                    });

                                                progress = newProgress;
                                            }
                                        });

                                    window.showInformationMessage(Resources.Resources.Get("UpdateSuccess"));
                                    success = true;
                                    return this.ExecuteTaskInternal(task);
                                }
                                catch
                                {
                                    success = false;
                                }
                            }));
                    }
                    while (
                        !await FileSystem.pathExists(Puppeteer.executablePath()) &&
                        !success &&
                        await (window.showWarningMessage(
                            Resources.Resources.Get("UpdateFailed"),
                            Resources.Resources.Get("Yes"),
                            Resources.Resources.Get("No"))) === Resources.Resources.Get("Yes"));
                }
            }
            else if (
                exception instanceof FileException ||
                exception instanceof YAMLException ||
                exception instanceof MarkdownFileNotFoundException ||
                exception instanceof NoWorkspaceFolderException)
            {
                window.showErrorMessage(exception.Message);
            }
            else
            {
                throw exception;
            }
        }
    }
}
