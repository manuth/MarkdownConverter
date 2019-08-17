import FileSystem = require("fs-extra");
import Path = require("path");
import Puppeteer = require("puppeteer");
import Format = require("string-template");
import { commands, ExtensionContext, ProgressLocation, window } from "vscode";
import { Resources } from "./Properties/Resources";
import { Extension } from "./System/Extensibility/Extension";
import { ChainTask } from "./Tasks/ChainTask";
import { ChromiumNotFoundException } from "./Tasks/ChromiumNotFoundException";
import { ConvertAllTask } from "./Tasks/ConvertAllTask";
import { ConvertTask } from "./Tasks/ConvertTask";
import { Task } from "./Tasks/Task";

/**
 * Represents the `Markdown Converter` extension.
 */
export class MarkdownConverterExtension extends Extension
{
    /**
     * Gets the chromium-revision of the extension.
     */
    public get ChromiumRevision(): string
    {
        return require(Path.join(__dirname, "..", "node_modules", "puppeteer", "package.json"))["puppeteer"]["chromium_revision"];
    }

    /**
     * @inheritdoc
     */
    public async Activate(context: ExtensionContext)
    {
        context.subscriptions.push(
            commands.registerCommand("markdownConverter.Convert", async () => this.ExecuteTask(new ConvertTask(this))),
            commands.registerCommand("markdownConverter.ConvertAll", async () => this.ExecuteTask(new ConvertAllTask(this))),
            commands.registerCommand("markdownConverter.Chain", async () => this.ExecuteTask(new ChainTask(this))));

        return super.Active(context);
    }

    /**
     * @inheritdoc
     */
    protected async ExecuteTaskInternal(task: Task)
    {
        try
        {
            await super.ExecuteTaskInternal(task);
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
            else
            {
                throw exception;
            }
        }
    }
}