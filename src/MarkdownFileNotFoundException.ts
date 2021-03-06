import { Resources } from "./Properties/Resources";
import { FileNotFoundException } from "./System/IO/FileNotFoundException";

/**
 * Occurs when a markdown-file couldn't be found.
 */
export class MarkdownFileNotFoundException extends FileNotFoundException
{
    /**
     * Initializes a new instance of the MarkdownFileNotFoundException class.
     */
    public constructor()
    {
        super(null, null);
    }

    /**
     * @inheritdoc
     */
    public get Message(): string
    {
        return Resources.Resources.Get<string>("MarkdownFileException");
    }
}
