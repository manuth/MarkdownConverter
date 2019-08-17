import { Progress, TextDocument, window } from "vscode";
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
    public get Title()
    {
        return Resources.Resources.Get<string>("TaskTitle.Convert");
    }

    /**
     * @inheritdoc
     */
    protected async ExecuteTask(progressReporter?: Progress<IProgressState>, fileReporter?: Progress<IConvertedFile>)
    {
        return this.ConversionRunner.Execute(this.GetMarkdownDocument(), progressReporter, fileReporter);
    }

    /**
     * Tries to find a markdown-file.
     */
    protected GetMarkdownDocument(): TextDocument
    {
        if (window.activeTextEditor && (window.activeTextEditor.document.languageId === "markdown" || Settings.Default.IgnoreLanguageMode))
        {
            return window.activeTextEditor.document;
        }

        for (let textEditor of window.visibleTextEditors)
        {
            if (textEditor.document.languageId === "markdown")
            {
                return textEditor.document;
            }
        }

        throw new MarkdownFileNotFoundException();
    }
}