import { pathExists } from "fs-extra";
import puppeteer = require("puppeteer-core");
import { CancellationToken, Progress } from "vscode";
import { IConvertedFile } from "../../Conversion/IConvertedFile";
import { MarkdownConverterExtension } from "../../MarkdownConverterExtension";
import { Settings } from "../../Properties/Settings";
import { ChromiumNotFoundException } from "./ChromiumNotFoundException";
import { IProgressState } from "./IProgressState";
import { Task } from "./Task";

/**
 * Represents a task which depends on `puppeteer`.
 */
export abstract class PuppeteerTask extends Task<MarkdownConverterExtension>
{
    /**
     * Initializes a new instance of the {@link PuppeteerTask `PuppeteerTask`} class.
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
    public override get Extension(): MarkdownConverterExtension
    {
        return super.Extension;
    }

    /**
     * Executes the task.
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
    public async Execute(progressReporter?: Progress<IProgressState>, cancellationToken?: CancellationToken, fileReporter?: Progress<IConvertedFile>): Promise<void>
    {
        if (
            await pathExists(
                Settings.Default.ChromiumExecutablePath ??
                (puppeteer as unknown as puppeteer.PuppeteerNode).executablePath()))
        {
            await this.ExecuteTask(progressReporter, cancellationToken, fileReporter);
        }
        else
        {
            throw new ChromiumNotFoundException();
        }
    }

    /**
     * Executes the task.
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
    protected abstract ExecuteTask(progressReporter?: Progress<IProgressState>, cancellationToken?: CancellationToken, fileReporter?: Progress<IConvertedFile>): Promise<void>;
}
