
import Path = require("path");
import { Extension, extensions, Uri } from "vscode";

/**
 * Provides the functionality to load markdown-conributions.
 *
 * For more information see the original code:
 * https://github.com/Microsoft/vscode/blob/4be0f0723091ae10b14ba20b334847d607bb7d55/extensions/markdown-language-features/src/markdownExtensions.ts
 */
export class MarkdownContributions
{
    /**
     * The path to the markdown-extension.
     */
    public readonly extensionPath: string;

    /**
     * The provided scripts.
     */
    private readonly scripts: Uri[] = [];

    /**
     * The provided styles.
     */
    private readonly styles: Uri[] = [];

    /**
     * The roots of the markdown-preview.
     */
    private readonly resourceRoots: Uri[] = [];

    /**
     * The plugins of the markdown-preview.
     */
    private readonly plugins: Thenable<(md: any) => any>[] = [];

    /**
     * A value indicating whether the contributions are loaded.
     */
    private loaded = false;

    /**
     * Initializes a new instance of the `MarkdownContributions` class.
     */
    public constructor(extensionPath: string)
    {
        this.extensionPath = extensionPath;
    }

    /**
     * Gets the provided scripts.
     */
    public get previewScripts(): Uri[]
    {
        this.Load();
        return this.scripts;
    }

    /**
     * Gets the provided styles.
     */
    public get previewStyles(): Uri[]
    {
        this.Load();
        return this.styles;
    }

    /**
     * Gets the roots of the markdown-preview.
     */
    public get previewResourceRoots(): Uri[]
    {
        this.Load();
        return this.resourceRoots;
    }

    /**
     * Gets the plugins of the markdown-preview.
     */
    public get markdownItPlugins(): Thenable<(md: any) => any>[]
    {
        this.Load();
        return this.plugins;
    }

    /**
     * Resolves the path to a resource.
     *
     * @param extension
     * The extension the resource belongs to.
     *
     * @param resourcePath
     * The path to the resource.
     */
    private static ResolveExtensionResource(extension: Extension<any>, resourcePath: string): Uri
    {
        return Uri.file(Path.join(extension.extensionPath, resourcePath)).with({ scheme: "vscode-resource" });
    }

    /**
     * Resolves the path to the resources of an extension.
     *
     * @param extension
     * The extension the resources belong to.
     *
     * @param resourcePaths
     * The paths to the resources.
     */
    private static ResolveExtensionResources(extension: Extension<any>, resourcePaths: string[]): Uri[]
    {
        let result: Uri[] = [];

        for (let resourcePath of resourcePaths)
        {
            try
            {
                result.push(MarkdownContributions.ResolveExtensionResource(extension, resourcePath));
            }
            catch
            { }
        }

        return result;
    }

    /**
     * Loads all contributions.
     */
    private async Load(): Promise<void>
    {
        if (this.loaded)
        {
            return;
        }

        this.loaded = true;
        for (const extension of extensions.all)
        {
            const contributes = extension.packageJSON && extension.packageJSON.contributes;
            if (!contributes)
            {
                continue;
            }

            this.tryLoadPreviewStyles(contributes, extension);
            this.LoadScripts(contributes, extension);
            this.LoadMarkdownPlugins(extension, contributes);

            if (contributes["markdown.previewScripts"] || contributes["markdown.previewStyles"])
            {
                this.resourceRoots.push(Uri.file(extension.extensionPath));
            }
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
    private LoadScripts(contributes: any, extension: Extension<any>)
    {
        this.scripts.push(...MarkdownContributions.ResolveExtensionResources(extension, contributes["markdown.previewScripts"]));
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
    private LoadMarkdownPlugins(extension: Extension<any>, contributes: any)
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
     * Loads the styles.
     *
     * @param contributes
     * The contributions of the extension.
     *
     * @param extension
     * The extension to load the contributions from.
     */
    private tryLoadPreviewStyles(contributes: any, extension: Extension<any>)
    {
        this.styles.push(...MarkdownContributions.ResolveExtensionResources(extension, contributes["markdown.previewStyles"]));
    }
}