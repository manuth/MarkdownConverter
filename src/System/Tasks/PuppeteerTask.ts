import FileSystem = require("fs-extra");
import Puppeteer = require("puppeteer-core");
import { CancellationToken, Progress } from "vscode";
import { IConvertedFile } from "../../Conversion/IConvertedFile";
import { MarkdownConverterExtension } from "../../MarkdownConverterExtension";
import { ChromiumNotFoundException } from "./ChromiumNotFoundException";
import { IProgressState } from "./IProgressState";
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
     *
     * @param fileReporter
     * A component for reporting converted files.
     */
    public async Execute(progressReporter?: Progress<IProgressState>, cancellationToken?: CancellationToken, fileReporter?: Progress<IConvertedFile>)
    {
        if (await FileSystem.pathExists(Puppeteer.executablePath()))
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
     */
    protected abstract async ExecuteTask(progressReporter?: Progress<IProgressState>, cancellationToken?: CancellationToken, fileReporter?: Progress<IConvertedFile>): Promise<void>;
}