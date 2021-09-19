import { join } from "upath";
import { Extension, extensions, Uri } from "vscode";

/**
 * Provides the functionality to load markdown-contributions.
 *
 * For more information see the original code:
 * https://github.com/Microsoft/vscode/blob/4be0f0723091ae10b14ba20b334847d607bb7d55/extensions/markdown-language-features/src/markdownExtensions.ts
 */
export class MarkdownContributions
{
    /**
     * The provided scripts.
     */
    private readonly scripts: Uri[] = [];

    /**
     * The provided styles.
     */
    private readonly styles: Uri[] = [];

    /**
     * A value indicating whether the contributions are loaded.
     */
    private loaded = false;

    /**
     * Initializes a new instance of the {@link MarkdownContributions `MarkdownContributions`} class.
     */
    public constructor()
    { }

    /**
     * Gets the provided scripts.
     */
    public get PreviewScripts(): Uri[]
    {
        this.Load();
        return this.scripts;
    }

    /**
     * Gets the provided styles.
     */
    public get PreviewStyles(): Uri[]
    {
        this.Load();
        return this.styles;
    }

    /**
     * Resolves the path to a resource.
     *
     * @param extension
     * The extension the resource belongs to.
     *
     * @param resourcePath
     * The path to the resource.
     *
     * @returns
     * The uri to the resource.
     */
    protected static ResolveExtensionResource(extension: Extension<any>, resourcePath: string): Uri
    {
        return Uri.file(join(extension.extensionPath, resourcePath)).with({ scheme: "vscode-resource" });
    }

    /**
     * Resolves the path to the resources of an extension.
     *
     * @param extension
     * The extension the resources belong to.
     *
     * @param resourcePaths
     * The paths to the resources.
     *
     * @returns
     * The uri to the resources.
     */
    protected static ResolveExtensionResources(extension: Extension<any>, resourcePaths: string[]): Uri[]
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
    protected Load(): void
    {
        if (this.loaded)
        {
            return;
        }

        for (let extension of extensions.all)
        {
            let contributes = extension.packageJSON?.contributes;

            if (!contributes)
            {
                continue;
            }

            this.LoadStyles(contributes, extension);
            this.LoadScripts(contributes, extension);
        }

        this.loaded = true;
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
    protected LoadScripts(contributes: any, extension: Extension<any>): void
    {
        let scripts = contributes["markdown.previewScripts"];

        if (scripts instanceof Array)
        {
            this.scripts.push(...MarkdownContributions.ResolveExtensionResources(extension, scripts));
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
    protected LoadStyles(contributes: any, extension: Extension<any>): void
    {
        let styles = contributes["markdown.previewStyles"];

        if (styles instanceof Array)
        {
            this.styles.push(...MarkdownContributions.ResolveExtensionResources(extension, styles));
        }
    }
}
