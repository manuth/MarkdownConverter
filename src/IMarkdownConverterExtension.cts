import { ExtensionContext } from "vscode";
import { IExtension } from "./System/Extensibility/IExtension.cjs";

/**
 * Represents the `Markdown Converter` extension.
 */
export interface IMarkdownConverterExtension extends IExtension
{
    /**
     * Gets the context of the extension.
     */
    get Context(): ExtensionContext;

    /**
     * Gets the chromium-revision of the extension.
     */
    get ChromiumRevision(): string;
}
