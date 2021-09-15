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
    private static ResolveExtensionResource(extension: Extension<any>, resourcePath: string): Uri
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
            const contributes = extension.packageJSON?.contributes;

            if (!contributes)
            {
                continue;
            }

            this.tryLoadPreviewStyles(contributes, extension);
            this.LoadScripts(contributes, extension);
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
    private LoadScripts(contributes: any, extension: Extension<any>): void
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
    private tryLoadPreviewStyles(contributes: any, extension: Extension<any>): void
    {
        let styles = contributes["markdown.previewStyles"];

        if (styles instanceof Array)
        {
            this.styles.push(...MarkdownContributions.ResolveExtensionResources(extension, styles));
        }
    }
}
