import { Resources } from "../Properties/Resources";
import { Exception } from "./Exception";

/**
 * Occurs when no workspace-folder is opened.
 */
export class NoWorkspaceFolderException extends Exception
{
    /**
     * Initializes a new instance of the MarkdownFileNotFoundException class.
     */
    constructor()
    {
        super(Resources.Resources.Get("NoWorkspaceFolderException"), null);
    }
}