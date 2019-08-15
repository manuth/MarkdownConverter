import { ExtensionContext } from "vscode";
import { MarkdownConverterExtension } from "./MarkdownConverterExtension";

/**
 * An instance of the extension.
 */
const extension = new MarkdownConverterExtension();

/**
 * Activates the extension.
 *
 * @param context
 * The context provided by Visual Studio Code.
 */
export let activate = async (context: ExtensionContext) => extension.Activate(context);

/**
 * Deactivates the extension.
 */
export let deactivate = async () => extension.Dispose();