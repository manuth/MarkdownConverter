
import * as path from "path";
import * as vscode from "vscode";

/* This class was copied from vscode:
 * https://github.com/Microsoft/vscode/blob/4be0f0723091ae10b14ba20b334847d607bb7d55/extensions/markdown-language-features/src/markdownExtensions.ts
 */

/**
 * Resolves a resource of a markdown-extension.
 *
 * @param extension
 * The extension the resource belongs to.
 *
 * @param resourcePath
 * The path to the resource.
 */
const resolveExtensionResource = (extension: vscode.Extension<any>, resourcePath: string): vscode.Uri =>
{
    return vscode.Uri.file(path.join(extension.extensionPath, resourcePath)).with({ scheme: "vscode-resource" });
};

/**
 * Resolves multiple resources of a markdown-extension.
 *
 * @param extension
 * The extension the resources belong to.
 *
 * @param resourcePaths
 * The paths of the resources to resolve.
 */
const resolveExtensionResources = (extension: vscode.Extension<any>, resourcePaths: string[]): vscode.Uri[] =>
{
    const result: vscode.Uri[] = [];
    if (Array.isArray(resourcePaths))
    {
        for (const resource of resourcePaths)
        {
            try
            {
                result.push(resolveExtensionResource(extension, resource));
            }
            catch (e)
            {
            }
        }
    }
    return result;
};

/**
 * Represents the contributions of a markdown-extension.
 */
export class MarkdownExtensionContributions
{
    /**
     * The path to the markdown-extension.
     */
    public readonly extensionPath: string;

    /**
     * The provided scripts.
     */
    private readonly scripts: vscode.Uri[] = [];

    /**
     * The provided styles.
     */
    private readonly styles: vscode.Uri[] = [];

    /**
     * The roots of the markdown-preview.
     */
    private readonly previewResourceRootsVal: vscode.Uri[] = [];

    /**
     * The plugins of the markdown-preview.
     */
    private readonly plugins: Thenable<(md: any) => any>[] = [];

    /**
     * A value indicating whether the contributions are loaded.
     */
    private loaded = false;

    public constructor(extensionPath: string)
    {
        this.extensionPath = extensionPath;
    }

    /**
     * Gets the provided scripts.
     */
    public get previewScripts(): vscode.Uri[]
    {
        this.load();
        return this.scripts;
    }

    /**
     * Gets the provided styles.
     */
    public get previewStyles(): vscode.Uri[]
    {
        this.load();
        return this.styles;
    }

    /**
     * Gets the roots of the markdown-preview.
     */
    public get previewResourceRoots(): vscode.Uri[]
    {
        this.load();
        return this.previewResourceRootsVal;
    }

    /**
     * Gets the plugins of the markdown-preview.
     */
    public get markdownItPlugins(): Thenable<(md: any) => any>[]
    {
        this.load();
        return this.plugins;
    }

    /**
     * Loads the contributions of all extension.
     */
    private load()
    {
        if (this.loaded)
        {
            return;
        }

        this.loaded = true;
        for (const extension of vscode.extensions.all)
        {
            const contributes = extension.packageJSON && extension.packageJSON.contributes;
            if (!contributes)
            {
                continue;
            }

            this.tryLoadPreviewStyles(contributes, extension);
            this.tryLoadPreviewScripts(contributes, extension);
            this.tryLoadMarkdownItPlugins(contributes, extension);

            if (contributes["markdown.previewScripts"] || contributes["markdown.previewStyles"])
            {
                this.previewResourceRootsVal.push(vscode.Uri.file(extension.extensionPath));
            }
        }
    }

    /**
     * Loads a markdown-it plugin.
     *
     * @param contributes
     * The contributions of the extension.
     *
     * @param extension
     * The extension of to load the plug-in from.
     */
    private tryLoadMarkdownItPlugins(contributes: any, extension: vscode.Extension<any>)
    {
        if (contributes["markdown.markdownItPlugins"])
        {
            this.plugins.push(extension.activate().then(() =>
            {
                if (extension.exports && extension.exports.extendMarkdownIt)
                {
                    return (md: any) => extension.exports.extendMarkdownIt(md);
                }
                return (md: any) => md;
            }));
        }
    }

    /**
     * Loads the preview-scripts.
     *
     * @param contributes
     * The contributions of the extension.
     *
     * @param extension
     * The extension to load the contributions from.
     */
    private tryLoadPreviewScripts(contributes: any, extension: vscode.Extension<any>)
    {
        this.scripts.push(...resolveExtensionResources(extension, contributes["markdown.previewScripts"]));
    }

    /**
     * Loads the styles.
     *
     * @param contributes
     * The contributions of the extension.
     *
     * @param extension
     * The extension to load the contributions from.
     */
    private tryLoadPreviewStyles(contributes: any, extension: vscode.Extension<any>)
    {
        this.styles.push(...resolveExtensionResources(extension, contributes["markdown.previewStyles"]));
    }
}

/**
 * Gets all markdown-contributions.
 *
 * @param context
 * The context provided by Visual Studio Code.
 */
export function getMarkdownExtensionContributions(context: vscode.ExtensionContext): MarkdownExtensionContributions
{
    return new MarkdownExtensionContributions(context.extensionPath);
}