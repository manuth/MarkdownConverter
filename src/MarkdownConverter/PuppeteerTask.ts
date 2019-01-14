import * as FileSystem from "fs-extra";
import * as Puppeteer from "puppeteer";
import * as Format from "string-template";
import { ProgressLocation, window } from "vscode";
import { Extension } from "../extension";
import { ResourceManager } from "../Properties/ResourceManager";
import { Exception } from "../System/Exception";
import { Task } from "./Task";

/**
 * Represents a task which depends on Puppeteer.
 */
export abstract class PuppeteerTask extends Task
{
    /**
     * Initializes a new instance of the `PuppeteerTask` class.
     *
     * @param extension
     * The extension this task belongs to.
     */
    public constructor(extension: Extension)
    {
        super(extension);
    }

    /**
     * Executes the task.
     */
    public async Execute()
    {
        try
        {
            if (await FileSystem.pathExists(Puppeteer.executablePath()))
            {
                await this.ExecuteTask();
            }
            else if (
                await (window.showInformationMessage(
                    ResourceManager.Resources.Get("UpdateMessage"),
                    ResourceManager.Resources.Get<string>("No")) as Promise<string>) === ResourceManager.Resources.Get<string>("Yes"))
            {
                let revision = this.Extension.ChromiumRevision;
                let success = false;

                do
                {
                    await (window.withProgress(
                        {
                            location: ProgressLocation.Notification,
                            title: Format(ResourceManager.Resources.Get("UpdateRunning"), revision)
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

                                window.showInformationMessage(ResourceManager.Resources.Get("UpdateSuccess"));
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
                        ResourceManager.Resources.Get("UpdateFailed"),
                        ResourceManager.Resources.Get("Yes"),
                        ResourceManager.Resources.Get("No")) as Promise<string>) === ResourceManager.Resources.Get("Yes"));
            }
        }
        catch (exception)
        {
            let message: string;

            if (exception instanceof Exception)
            {
                message = exception.Message;
            }
            else if (exception instanceof Error)
            {
                message = Format(ResourceManager.Resources.Get("UnknownException"), exception.name, exception.message);
            }
            else
            {
                message = `${exception}`;
            }

            window.showErrorMessage(message);
        }
    }

    /**
     * Executes the task.
     */
    protected abstract async ExecuteTask(): Promise<void>;
}