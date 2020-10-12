import { CancellationToken, Progress, TextDocument, window } from "vscode";
import { IConvertedFile } from "../../Conversion/IConvertedFile";
import { MarkdownConverterExtension } from "../../MarkdownConverterExtension";
import { MarkdownFileNotFoundException } from "../../MarkdownFileNotFoundException";
import { Resources } from "../../Properties/Resources";
import { Settings } from "../../Properties/Settings";
import { ConversionTask } from "./ConversionTask";
import { IProgressState } from "./IProgressState";

/**
 * Represens a task for converting the currently opened document.
 */
export class ConvertTask extends ConversionTask
{
    /**
     * Initializes a new instance of the `ConvertTask` class.
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
     * Tries to find a markdown-file.
     *
     * @returns
     * The best matching markdown-document.
     */
    protected GetMarkdownDocument(): TextDocument
    {
        if (window.activeTextEditor && (window.activeTextEditor.document.languageId === "markdown" || Settings.Default.IgnoreLanguageMode))
        {
            return window.activeTextEditor.document;
        }
        else
        {
            throw new MarkdownFileNotFoundException();
        }
    }
}
