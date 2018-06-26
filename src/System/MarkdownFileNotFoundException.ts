import FileNotFoundException from "./IO/FileNotFoundException";

/**
 * Occurs when a markdown-file couldn't be found.
 */
export default class MarkdownFileNotFoundException extends FileNotFoundException
{
    /**
     * Initializes a new instance of the MarkdownFileNotFoundException class.
     */
    constructor()
    {
        super('Couldn\'t find a markdown-file.', null);
    }
}