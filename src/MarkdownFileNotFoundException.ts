import { Resources } from "./Properties/Resources.js";
import { FileNotFoundException } from "./System/IO/FileNotFoundException.js";

/**
 * Occurs when a markdown-file couldn't be found.
 */
export class MarkdownFileNotFoundException extends FileNotFoundException
{
    /**
     * Initializes a new instance of the {@link MarkdownFileNotFoundException `MarkdownFileNotFoundException`} class.
     */
    public constructor()
    {
        super(null, null);
    }

    /**
     * @inheritdoc
     */
    public override get Message(): string
    {
        return Resources.Resources.Get<string>("MarkdownFileException");
    }
}
