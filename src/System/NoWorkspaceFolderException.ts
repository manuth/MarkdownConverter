import { Resources } from "../Properties/Resources.js";
import { Exception } from "./Exception.js";

/**
 * Represents an exception which occurs when no workspace-folder is opened.
 */
export class NoWorkspaceFolderException extends Exception
{
    /**
     * Initializes a new instance of the {@link NoWorkspaceFolderException `NoWorkspaceFolderException`} class.
     */
    public constructor()
    {
        super(Resources.Resources.Get("NoWorkspaceFolderException"), null);
    }

    /**
     * @inheritdoc
     */
    public override get Message(): string
    {
        return super.Message ?? Resources.Resources.Get("NoWorkspaceFolderException");
    }
}
