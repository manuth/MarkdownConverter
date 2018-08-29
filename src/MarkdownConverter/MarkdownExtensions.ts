
import * as path from "path";
import * as vscode from "vscode";

// This class was copied from vscode
// https://github.com/Microsoft/vscode/blob/4be0f0723091ae10b14ba20b334847d607bb7d55/extensions/markdown-language-features/src/markdownExtensions.ts

const resolveExtensionResource = (extension: vscode.Extension<any>, resourcePath: string): vscode.Uri =>
{
    return vscode.Uri.file(path.join(extension.extensionPath, resourcePath))
        .with({ scheme: "vscode-resource" });
};

const resolveExtensionResources = (extension: vscode.Extension<any>, resourcePaths: any): vscode.Uri[] =>
{
    const result: vscode.Uri[] = [];
    if (Array.isArray(resourcePaths))
    {
        for (const resource of resourcePaths)
        {
            try
            {
                result.push(resolveExtensionResource(extension, resource));
            } catch (e)
            {
                // noop
            }
        }
    }
    return result;
};

export class MarkdownExtensionContributions
{
    private readonly scripts: vscode.Uri[] = [];
    private readonly styles: vscode.Uri[] = [];
    private readonly previewResourceRootsVal: vscode.Uri[] = [];
    private readonly plugins: Thenable<(md: any) => any>[] = [];

    private loaded = false;

    public constructor(
        public readonly extensionPath: string,
    ) { }

    public get previewScripts(): vscode.Uri[]
    {
        this.ensureLoaded();
        return this.scripts;
    }

    public get previewStyles(): vscode.Uri[]
    {
        this.ensureLoaded();
        return this.styles;
    }

    public get previewResourceRoots(): vscode.Uri[]
    {
        this.ensureLoaded();
        return this.previewResourceRootsVal;
    }

    public get markdownItPlugins(): Thenable<(md: any) => any>[]
    {
        this.ensureLoaded();
        return this.plugins;
    }

    private ensureLoaded()
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

    private tryLoadMarkdownItPlugins(
        contributes: any,
        extension: vscode.Extension<any>
    )
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

    private tryLoadPreviewScripts(
        contributes: any,
        extension: vscode.Extension<any>
    )
    {
        this.scripts.push(...resolveExtensionResources(extension, contributes["markdown.previewScripts"]));
    }

    private tryLoadPreviewStyles(
        contributes: any,
        extension: vscode.Extension<any>
    )
    {
        this.styles.push(...resolveExtensionResources(extension, contributes["markdown.previewStyles"]));
    }
}

export function getMarkdownExtensionContributions(context: vscode.ExtensionContext): MarkdownExtensionContributions
{
    return new MarkdownExtensionContributions(context.extensionPath);
}