import fs from "fs-extra";
import { CancellationToken, Progress } from "vscode";
import { Constants } from "../../Constants.js";
import { IConvertedFile } from "../../Conversion/IConvertedFile.js";
import { MarkdownConverterExtension } from "../../MarkdownConverterExtension.js";
import { Settings } from "../../Properties/Settings.js";
import { ChromiumNotFoundException } from "./ChromiumNotFoundException.js";
import { IProgressState } from "./IProgressState.js";
import { Task } from "./Task.js";

const { pathExists } = fs;

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
                Constants.Puppeteer.executablePath()))
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
