import { TextDocument, window } from "vscode";
import { Extension } from "../extension";
import { Settings } from "../Properties/Settings";
import { ConversionTask } from "./ConversionTask";
import { MarkdownFileNotFoundException } from "./MarkdownFileNotFoundException";

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

    public async ExecuteTask()
    {
        this.Convert(this.GetMarkdownDocument());
    }
}