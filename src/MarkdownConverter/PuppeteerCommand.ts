import * as FileSystem from "fs-extra";
import * as Puppeteer from "puppeteer";
import * as Format from "string-template";
import { ProgressLocation, window } from "vscode";
import { Extension } from "../extension";
import { ResourceManager } from "../Properties/ResourceManager";
import { Exception } from "../System/Exception";
import { Command } from "./Command";

/**
 * Represents a command which depends on Puppeteer.
 */
export abstract class PuppeteerCommand extends Command
{
    /**
     * Initializes a new instance of the `PuppeteerCommand` class.
     * 
     * @param extension
     * The extension this command belongs to.
     */
    public constructor(extension: Extension)
    {
        super(extension);
    }

    /**
     * Executes the command.
     */
    public async Execute()
    {
        try
        {
            if (await FileSystem.pathExists(Puppeteer.executablePath()))
            {
                await this.ExecuteCommand();
            }
            else if (
                await window.showInformationMessage(
                    ResourceManager.Resources.Get("UpdateMessage"),
                    ResourceManager.Resources.Get<string>("No")) === ResourceManager.Resources.Get<string>("Yes"))
            {
                let revision = this.Extension.ChromiumRevision;
                let success = false;

                do
                {
                    await window.withProgress(
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
                                    (downloadBytes, totalBytes) =>
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
                        });
                }
                while (
                    !await FileSystem.pathExists(Puppeteer.executablePath()) &&
                    !success &&
                    await window.showWarningMessage(
                        ResourceManager.Resources.Get("UpdateFailed"),
                        ResourceManager.Resources.Get("Yes"),
                        ResourceManager.Resources.Get("No")) === ResourceManager.Resources.Get("Yes"));
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
                message = "" + exception;
            }

            window.showErrorMessage(message);
        }
    }

    /**
     * Executes the command.
     */
    protected abstract async ExecuteCommand();
}