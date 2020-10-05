import { pathExists } from "fs-extra";
import { executablePath } from "puppeteer-core";
import { CancellationToken, CancellationTokenSource, Progress } from "vscode";
import { IConvertedFile } from "../../Conversion/IConvertedFile";
import { MarkdownConverterExtension } from "../../MarkdownConverterExtension";
import { ChromiumNotFoundException } from "./ChromiumNotFoundException";
import { IProgressState } from "./IProgressState";
import { Task } from "./Task";

/**
 * Represents a task which depends on
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
    public get Extension(): MarkdownConverterExtension
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
        if (await pathExists(executablePath()))
        {
            await this.ExecuteTask(progressReporter || { report() { } }, cancellationToken || new CancellationTokenSource().token, fileReporter || { report() { } });
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
    protected abstract async ExecuteTask(progressReporter?: Progress<IProgressState>, cancellationToken?: CancellationToken, fileReporter?: Progress<IConvertedFile>): Promise<void>;
}
