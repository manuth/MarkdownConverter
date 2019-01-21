import { ResourceManager } from "./Properties/ResourceManager";
import { FileNotFoundException } from "./System/IO/FileNotFoundException";

/**
 * Occurs when a markdown-file couldn't be found.
 */
export class MarkdownFileNotFoundException extends FileNotFoundException
{
    /**
     * Initializes a new instance of the MarkdownFileNotFoundException class.
     */
    constructor()
    {
        super(ResourceManager.Resources.Get("MarkdownFileException"), null);
    }
}