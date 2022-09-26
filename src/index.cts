import { ExtensionContext } from "vscode";

/**
 * An instance of the extension.
 */
export let extension: any = null;

/**
 * Activates the extension.
 *
 * @param context
 * The context provided by Visual Studio Code.
 *
 * @returns
 * The extension-body.
 */
export let activate = async (context: ExtensionContext): Promise<unknown> =>
{
    extension = new (await import("./MarkdownConverterExtension.js")).MarkdownConverterExtension(context);
    return extension.Activate();
};

/**
 * Deactivates the extension.
 */
export let deactivate = async (): Promise<void> => extension?.Dispose();
