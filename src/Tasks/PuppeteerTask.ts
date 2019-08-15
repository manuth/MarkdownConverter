import FileSystem = require("fs-extra");
import Puppeteer = require("puppeteer");
import Format = require("string-template");
import { ProgressLocation, window } from "vscode";
import { MarkdownConverterExtension } from "../MarkdownConverterExtension";
import { Resources } from "../Properties/Resources";
import { Exception } from "../System/Exception";
import { Task } from "./Task";

/**
 * Represents a task which depends on Puppeteer.
 */
export abstract class PuppeteerTask extends Task<MarkdownConverterExtension>
{
    /**
     * Initializes a new instance of the `PuppeteerTask` class.
     *
     * @param extension
     * The extension this task belongs to.
     */
    public constructor(extension: MarkdownConverterExtension)
    {
        super(extension);
    }

    /**
     * Gets or sets the extension this task belongs to.
     */
    public get Extension()
    {
        return super.Extension;
    }

    /**
     * Executes the task.
     */
    public async Execute()
    {
        if (await FileSystem.pathExists(Puppeteer.executablePath()))
        {
            await this.ExecuteTask();
        }
        else if (
            await (window.showInformationMessage(
                Resources.Resources.Get("UpdateMessage"),
                Resources.Resources.Get<string>("Yes"),
                Resources.Resources.Get<string>("No")) as Promise<string>) === Resources.Resources.Get<string>("Yes"))
        {
            let revision = this.Extension.ChromiumRevision;
            let success = false;

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
                            let browserFetcher = (Puppeteer as any).createBrowserFetcher();

                            await browserFetcher.download(
                                revision,
                                (downloadBytes: number, totalBytes: number) =>
                                {
                                    let newProgress = Math.floor((downloadBytes / totalBytes) * 100);

                                    if (newProgress > progress)
                                    {
                                        reporter.report({
                                            increment: newProgress - progress
                                        });

                                        progress = newProgress;
                                    }
                                });

                            window.showInformationMessage(Resources.Resources.Get("UpdateSuccess"));
                            success = true;
                        }
                        catch
                        {
                            success = false;
                        }
                    }) as Promise<void>);
            }
            while (
                !await FileSystem.pathExists(Puppeteer.executablePath()) &&
                !success &&
                await (window.showWarningMessage(
                    Resources.Resources.Get("UpdateFailed"),
                    Resources.Resources.Get("Yes"),
                    Resources.Resources.Get("No")) as Promise<string>) === Resources.Resources.Get("Yes"));
        }
    }

    /**
     * Executes the task.
     */
    protected abstract async ExecuteTask(): Promise<void>;
}