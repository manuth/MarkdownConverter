import { TextDocument, window } from "vscode";
import { ConversionTask } from "./ConversionTask";
import { Extension } from "./extension";
import { MarkdownFileNotFoundException } from "./MarkdownFileNotFoundException";
import { Settings } from "./Properties/Settings";

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
    public constructor(extension: Extension)
    {
        super(extension);
    }

    public async ExecuteTask()
    {
        return this.Convert(this.GetMarkdownDocument());
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