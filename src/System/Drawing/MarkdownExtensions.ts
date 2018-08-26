
import * as path from "path";
import * as vscode from "vscode";

// This class was copied from vscode
// https://github.com/Microsoft/vscode/blob/4be0f0723091ae10b14ba20b334847d607bb7d55/extensions/markdown-language-features/src/markdownExtensions.ts

const resolveExtensionResource = (extension: vscode.Extension<any>, resourcePath: string): vscode.Uri => {
    return vscode.Uri.file(path.join(extension.extensionPath, resourcePath))
        .with({ scheme: "vscode-resource" });
};

const resolveExtensionResources = (extension: vscode.Extension<any>, resourcePaths: any): vscode.Uri[] => {
    const result: vscode.Uri[] = [];
    if (Array.isArray(resourcePaths)) {
        for (const resource of resourcePaths) {
            try {
                result.push(resolveExtensionResource(extension, resource));
            } catch (e) {
                // noop
            }
        }
    }
    return result;
};

export class MarkdownExtensionContributions {
    private readonly scripts: vscode.Uri[] = [];
    private readonly _styles: vscode.Uri[] = [];
    private readonly _previewResourceRoots: vscode.Uri[] = [];
    private readonly _plugins: Thenable<(md: any) => any>[] = [];

    private _loaded = false;

    public constructor(
        public readonly extensionPath: string,
    ) { }

    public get previewScripts(): vscode.Uri[] {
        this.ensureLoaded();
        return this.scripts;
    }

    public get previewStyles(): vscode.Uri[] {
        this.ensureLoaded();
        return this._styles;
    }

    public get previewResourceRoots(): vscode.Uri[] {
        this.ensureLoaded();
        return this._previewResourceRoots;
    }

    public get markdownItPlugins(): Thenable<(md: any) => any>[] {
        this.ensureLoaded();
        return this._plugins;
    }

    private ensureLoaded() {
        if (this._loaded) {
            return;
        }

        this._loaded = true;
        for (const extension of vscode.extensions.all) {
            const contributes = extension.packageJSON && extension.packageJSON.contributes;
            if (!contributes) {
                continue;
            }

            this.tryLoadPreviewStyles(contributes, extension);
            this.tryLoadPreviewScripts(contributes, extension);
            this.tryLoadMarkdownItPlugins(contributes, extension);

            if (contributes['markdown.previewScripts'] || contributes['markdown.previewStyles']) {
                this._previewResourceRoots.push(vscode.Uri.file(extension.extensionPath));
            }
        }
    }

    private tryLoadMarkdownItPlugins(
        contributes: any,
        extension: vscode.Extension<any>
    ) {
        if (contributes['markdown.markdownItPlugins']) {
            this._plugins.push(extension.activate().then(() => {
                if (extension.exports && extension.exports.extendMarkdownIt) {
                    return (md: any) => extension.exports.extendMarkdownIt(md);
                }
                return (md: any) => md;
            }));
        }
    }

    private tryLoadPreviewScripts(
        contributes: any,
        extension: vscode.Extension<any>
    ) {
        this.scripts.push(...resolveExtensionResources(extension, contributes['markdown.previewScripts']));
    }

    private tryLoadPreviewStyles(
        contributes: any,
        extension: vscode.Extension<any>
    ) {
        this._styles.push(...resolveExtensionResources(extension, contributes['markdown.previewStyles']));
    }
}

export function getMarkdownExtensionContributions(context: vscode.ExtensionContext): MarkdownExtensionContributions {
    return new MarkdownExtensionContributions(context.extensionPath);
}