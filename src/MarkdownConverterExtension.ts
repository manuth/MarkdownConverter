import { exec } from "node:child_process";
import { createRequire } from "node:module";
import { Package } from "@manuth/package-json-editor";
import fs from "fs-extra";
import { PUPPETEER_REVISIONS } from "puppeteer-core/lib/esm/puppeteer/revisions.js";
import format from "string-template";
import path from "upath";
import vscode, { ExtensionContext, Progress } from "vscode";
import { Constants } from "./Constants.js";
import { ConversionType } from "./Conversion/ConversionType.js";
import { IConvertedFile } from "./Conversion/IConvertedFile.js";
import { IMarkdownConverterExtension } from "./IMarkdownConverterExtension.cjs";
import { Resources } from "./Properties/Resources.js";
import { Settings } from "./Properties/Settings.js";
import { Exception } from "./System/Exception.js";
import { Extension } from "./System/Extensibility/Extension.js";
import { OperationCancelledException } from "./System/OperationCancelledException.js";
import { ChainTask } from "./System/Tasks/ChainTask.js";
import { ChromiumNotFoundException } from "./System/Tasks/ChromiumNotFoundException.js";
import { ConvertAllTask } from "./System/Tasks/ConvertAllTask.js";
import { ConvertTask } from "./System/Tasks/ConvertTask.js";
import { IProgressState } from "./System/Tasks/IProgressState.js";
import { PuppeteerTask } from "./System/Tasks/PuppeteerTask.js";

const { mkdirp, pathExists } = fs;
const { join, resolve } = path;
const { commands, ProgressLocation, window } = createRequire(Constants.PackageURL)("vscode") as typeof vscode;

/**
 * Represents the `Markdown Converter` extension.
 */
export class MarkdownConverterExtension extends Extension implements IMarkdownConverterExtension
{
    /**
     * The context of the extension.
     */
    private context: ExtensionContext = null;

    /**
     * Provides the functionality to report converted files.
     */
    private fileReporter: Progress<IConvertedFile>;

    /**
     * Initializes a new instance of the {@link MarkdownConverterExtension `MarkdownConverterExtension`} class.
     *
     * @param context
     * The context of the extension.
     */
    public constructor(context: ExtensionContext)
    {
        super(new Package(join(Constants.PackageDirectory, Package.FileName)));
        this.context = context;

        this.fileReporter = {
            async report(file)
            {
                let result = await (window.showInformationMessage(
                    format(Resources.Resources.Get("SuccessMessage"), ConversionType[file.Type], file.FileName),
                    Resources.Resources.Get("OpenFileLabel")));

                if (result === Resources.Resources.Get("OpenFileLabel"))
                {
                    switch (process.platform)
                    {
                        case "win32":
                            exec(`"${file.FileName}"`);
                            break;
                        case "darwin":
                            exec(`bash -c 'open "${file.FileName}"'`);
                            break;
                        case "linux":
                            exec(`bash -c 'xdg-open "${file.FileName}"'`);
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
     * @inheritdoc
     */
    public get Context(): ExtensionContext
    {
        return this.context;
    }

    /**
     * @inheritdoc
     */
    public get ChromiumRevision(): string
    {
        return PUPPETEER_REVISIONS.chromium;
    }

    /**
     * @inheritdoc
     *
     * @returns
     * The extension-body.
     */
    public override async Activate(): Promise<unknown>
    {
        this.Context.subscriptions.push(
            commands.registerCommand("markdownConverter.Convert", async () => this.ExecuteTask(new ConvertTask(this))),
            commands.registerCommand("markdownConverter.ConvertAll", async () => this.ExecuteTask(new ConvertAllTask(this))),
            commands.registerCommand("markdownConverter.Chain", async () => this.ExecuteTask(new ChainTask(this))));

        return super.Activate();
    }

    /**
     * @inheritdoc
     *
     * @param task
     * The task to execute.
     */
    protected override async ExecuteTaskInternal(task: PuppeteerTask): Promise<void>
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
                if (Settings.Default.ChromiumExecutablePath)
                {
                    do
                    {
                        if (await pathExists(Settings.Default.ChromiumExecutablePath))
                        {
                            return this.ExecuteTaskInternal(task);
                        }
                    }
                    while (
                        !await pathExists(Settings.Default.ChromiumExecutablePath) &&
                        await (window.showWarningMessage(
                            Resources.Resources.Get("CustomBrowserNotFound"),
                            Resources.Resources.Get("Yes"),
                            Resources.Resources.Get("No"))) === Resources.Resources.Get("Yes"));
                }
                else if (
                    await (window.showInformationMessage(
                        Resources.Resources.Get("UpdateMessage"),
                        Resources.Resources.Get("Yes"),
                        Resources.Resources.Get("No"))) === Resources.Resources.Get<string>("Yes"))
                {
                    let success = false;
                    let puppeteerPath = resolve(Constants.PackageDirectory, "node_modules", "puppeteer-core");

                    if (!await pathExists(puppeteerPath))
                    {
                        await mkdirp(puppeteerPath);
                    }

                    do
                    {
                        await (window.withProgress(
                            {
                                location: ProgressLocation.Notification,
                                title: format(Resources.Resources.Get("UpdateRunning"), this.ChromiumRevision)
                            },
                            async (reporter) =>
                            {
                                try
                                {
                                    await this.DownloadUpdate(reporter);
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
                        !await pathExists(Constants.Puppeteer.executablePath()) &&
                        !success &&
                        await (window.showWarningMessage(
                            Resources.Resources.Get("UpdateFailed"),
                            Resources.Resources.Get("Yes"),
                            Resources.Resources.Get("No"))) === Resources.Resources.Get("Yes"));
                }
            }
            else if (exception instanceof OperationCancelledException)
            {
                window.showInformationMessage(exception.Message);
            }
            else if (exception instanceof Exception)
            {
                window.showErrorMessage(exception.Message);
            }
            else
            {
                throw exception;
            }
        }
    }

    /**
     * Downloads an update.
     *
     * @param reporter
     * A component for reporting progress.
     */
    protected async DownloadUpdate(reporter: Progress<IProgressState>): Promise<void>
    {
        let progress = 0;
        let browserFetcher = Constants.Puppeteer.createBrowserFetcher({});

        await browserFetcher.download(
            this.ChromiumRevision,
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
    }
}
