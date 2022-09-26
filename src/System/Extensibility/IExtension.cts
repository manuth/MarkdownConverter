import MarkdownIt from "markdown-it";

/**
 * Represents an extension.
 */
export interface IExtension
{
    /**
     * Gets the path to the root of the extension.
     */
    get ExtensionRoot(): string;

    /**
     * Gets the author of the extension.
     */
    get Author(): string;

    /**
     * Gets the name of the extension.
     */
    get Name(): string;

    /**
     * Gets the full name of the extension.
     */
    get FullName(): string;

    /**
     * Gets the parser provided by Visual Studio Code.
     */
    get VSCodeParser(): MarkdownIt;

    /**
     * Activates the extension.
     *
     * @returns
     * The extension-body.
     */
    Activate(): Promise<unknown>;

    /**
     * Disposes the extension.
     */
    Dispose(): Promise<void>;

    /**
     * Enables the system-parser.
     */
    EnableSystemParser(): Promise<void>;
}
