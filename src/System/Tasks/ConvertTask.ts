import { createRequire } from "node:module";
import vscode, { CancellationToken, Progress, TextDocument } from "vscode";
import { IConvertedFile } from "../../Conversion/IConvertedFile.js";
import { MarkdownConverterExtension } from "../../MarkdownConverterExtension.js";
import { MarkdownFileNotFoundException } from "../../MarkdownFileNotFoundException.js";
import { Resources } from "../../Properties/Resources.js";
import { Settings } from "../../Properties/Settings.js";
import { ConversionTask } from "./ConversionTask.js";
import { IProgressState } from "./IProgressState.js";

const { window } = createRequire(import.meta.url)("vscode") as typeof vscode;

/**
 * Represents a task for converting the currently opened document.
 */
export class ConvertTask extends ConversionTask
{
    /**
     * Initializes a new instance of the {@link ConvertTask `ConvertTask`} class.
     *
     * @param extension
     * The extension the task belongs to.
     */
    public constructor(extension: MarkdownConverterExtension)
    {
        super(extension);
    }

    /**
     * @inheritdoc
     */
    public get Title(): string
    {
        return Resources.Resources.Get<string>("TaskTitle.Convert");
    }

    /**
     * @inheritdoc
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
    protected async ExecuteTask(progressReporter?: Progress<IProgressState>, cancellationToken?: CancellationToken, fileReporter?: Progress<IConvertedFile>): Promise<void>
    {
        return this.ConversionRunner.Execute(this.GetMarkdownDocument(), progressReporter, cancellationToken, fileReporter);
    }

    /**
     * Tries to find a file to convert.
     *
     * @returns
     * The best matching markdown-document.
     */
    protected GetMarkdownDocument(): TextDocument
    {
        if (
            window.activeTextEditor &&
            (window.activeTextEditor.document.languageId === "markdown" || Settings.Default.IgnoreLanguageMode))
        {
            return window.activeTextEditor.document;
        }
        else
        {
            throw new MarkdownFileNotFoundException();
        }
    }
}
