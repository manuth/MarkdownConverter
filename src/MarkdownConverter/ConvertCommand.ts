import { TextDocument, window } from "vscode";
import { Extension } from "../extension";
import { Settings } from "../Properties/Settings";
import { ConversionCommand } from "./ConversionCommand";
import { MarkdownFileNotFoundException } from "./MarkdownFileNotFoundException";

/**
 * Represens a command for converting a markdown-document.
 */
export class ConvertCommand extends ConversionCommand
{
    /**
     * Initializes a new instance of the `ConvertCommand` class.
     * 
     * @param extension
     * The extension the command belongs to.
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

    public async ExecuteCommand()
    {
        this.Convert(this.GetMarkdownDocument());
    }
}