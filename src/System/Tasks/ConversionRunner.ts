import { createRequire } from "module";
import { CultureInfo } from "@manuth/resource-manager";
import { TempDirectory } from "@manuth/temp-files";
import fs from "fs-extra";
import hljs from "highlight.js";
import cloneDeep from "lodash.clonedeep";
import MarkdownIt from "markdown-it";
import checkbox from "markdown-it-checkbox";
import markdownContainer from "markdown-it-container";
import emoji from "markdown-it-emoji";
import markdownInclude from "markdown-it-include";
import StateCore from "markdown-it/lib/rules_core/state_core.js";
import Token from "markdown-it/lib/token.js";
import format from "string-template";
import twemoji from "twemoji";
import path from "upath";
import vscode, { CancellationToken, Progress, TextDocument, WorkspaceFolder } from "vscode";
import { ConversionType } from "../../Conversion/ConversionType.js";
import { Converter } from "../../Conversion/Converter.js";
import { IConvertedFile } from "../../Conversion/IConvertedFile.js";
import { MarkdownConverterExtension } from "../../MarkdownConverterExtension.js";
import { IRunningBlockContent } from "../../Properties/IRunningBlockContent.js";
import { Resources } from "../../Properties/Resources.js";
import { Settings } from "../../Properties/Settings.js";
import { Asset } from "../Documents/Assets/Asset.js";
import { AssetURLType } from "../Documents/Assets/AssetURLType.js";
import { InsertionType } from "../Documents/Assets/InsertionType.js";
import { StyleSheet } from "../Documents/Assets/StyleSheet.js";
import { WebScript } from "../Documents/Assets/WebScript.js";
import { AttributeKey } from "../Documents/AttributeKey.js";
import { Document } from "../Documents/Document.js";
import { EmojiType } from "../Documents/EmojiType.js";
import { EnvironmentKey } from "../Documents/EnvironmentKey.js";
import { ListType } from "../Documents/ListType.js";
import { Anchor } from "../Documents/Plugins/MarkdownAnchorPlugin.js";
import { TOC } from "../Documents/Plugins/MarkdownTocPlugin.js";
import { RunningBlock } from "../Documents/RunningBlock.js";
import { MarkdownContributions } from "../Extensibility/MarkdownContributions.js";
import { FileException } from "../IO/FileException.js";
import { IPatternContext } from "../IO/IPatternContext.js";
import { PatternResolver } from "../IO/PatternResolver.js";
import { OperationCancelledException } from "../OperationCancelledException.js";
import { AssetLoader } from "./AssetLoader.js";
import { IProgressState } from "./IProgressState.js";

const { pathExists, readFile } = fs;
const { highlight } = hljs;
const { dirname, isAbsolute, join, resolve } = path;
const { convert, parse } = twemoji;
const { window, workspace } = createRequire(import.meta.url)("vscode") as typeof vscode;

/**
 * Provides the functionality to load settings and run a {@link Converter `Converter`}.
 */
export class ConversionRunner
{
    /**
     * The name of the heading rule.
     */
    private static readonly headingRule = "heading_open";

    /**
     * The extension the runner belongs to.
     */
    private extension: MarkdownConverterExtension;

    /**
     * Initializes a new instance of the {@link ConversionRunner `ConversionRunner`} class.
     *
     * @param extension
     * The extension the runner belongs to.
     */
    public constructor(extension: MarkdownConverterExtension)
    {
        this.extension = extension;
    }

    /**
     * Gets or sets the extension the runner belongs to.
     */
    public get Extension(): MarkdownConverterExtension
    {
        return this.extension;
    }

    /**
     * @inheritdoc
     */
    public set Extension(value)
    {
        this.extension = value;
    }

    /**
     * Executes the underlying {@link Converter `Converter`}.
     *
     * @param document
     * The document to convert.
     *
     * @param progressReporter
     * A component for reporting progress.
     *
     * @param cancellationToken
     * A component for handling cancellation-requests.
     *
     * @param fileReporter
     * A component for reporting converted files.
     */
    public async Execute(document: TextDocument, progressReporter?: Progress<IProgressState>, cancellationToken?: CancellationToken, fileReporter?: Progress<IConvertedFile>): Promise<void>
    {
        if (!(cancellationToken?.isCancellationRequested ?? false))
        {
            let patternResolver: PatternResolver;
            let tasks: Array<Promise<void>> = [];
            let converter: Converter;
            let tempDir: TempDirectory;
            let workspaceFolder = this.GetWorkspacePath(document);
            patternResolver = new PatternResolver(Settings.Default.DestinationPattern, progressReporter);

            if (workspaceFolder === null)
            {
                if (
                    patternResolver.Variables.includes(nameof<IPatternContext>((c) => c.workspaceFolder)) ||
                    !isAbsolute(patternResolver.Pattern))
                {
                    while (workspaceFolder === null)
                    {
                        if (!(cancellationToken?.isCancellationRequested ?? false))
                        {
                            workspaceFolder = await (
                                window.showInputBox(
                                    {
                                        ignoreFocusOut: true,
                                        prompt: Resources.Resources.Get("DestinationPath"),
                                        placeHolder: Resources.Resources.Get("DestinationPathExample")
                                    }));
                        }
                        else
                        {
                            throw new OperationCancelledException();
                        }
                    }
                }
                else
                {
                    tempDir = new TempDirectory();
                    workspaceFolder = tempDir.FullName;
                }
            }

            converter = await this.LoadConverter(workspaceFolder, document);
            await converter.Initialize(progressReporter);

            for (let type of Settings.Default.ConversionType)
            {
                if (!(cancellationToken?.isCancellationRequested ?? false))
                {
                    tasks.push(
                        (async () =>
                        {
                            progressReporter?.report(
                                {
                                    message: format(Resources.Resources.Get("Progress.ConversionStarting"), ConversionType[type])
                                });

                            let destinationPath = patternResolver.Resolve(workspaceFolder, document, type);

                            if (
                                !isAbsolute(destinationPath) &&
                                !patternResolver.Variables.includes(nameof<IPatternContext>((c) => c.workspaceFolder)))
                            {
                                destinationPath = resolve(workspaceFolder, destinationPath);
                            }
                            else
                            {
                                destinationPath = resolve(destinationPath);
                            }

                            await converter.Start(type, destinationPath, progressReporter, cancellationToken);

                            progressReporter?.report(
                                {
                                    message: format(Resources.Resources.Get("Progress.ConverterFinished"), ConversionType[type])
                                });

                            fileReporter?.report(
                                {
                                    Type: type,
                                    FileName: destinationPath
                                });
                        })());
                }
                else
                {
                    throw new OperationCancelledException();
                }
            }

            await Promise.all(tasks);
            await converter.Dispose();
            tempDir?.Dispose();
        }
        else
        {
            throw new OperationCancelledException();
        }
    }

    /**
     * Determines the path to the workspace of the specified {@link document `document`}.
     *
     * @param document
     * The document to get the workspace-path for.
     *
     * @returns
     * The path to the workspace of the specified {@link document `document`}.
     */
    protected GetWorkspacePath(document: TextDocument): string
    {
        let documentDirname = document.isUntitled ? null : dirname(document.fileName);
        let currentWorkspace: WorkspaceFolder;

        if (document.isUntitled)
        {
            if ((workspace.workspaceFolders ?? []).length === 1)
            {
                currentWorkspace = workspace.workspaceFolders[0];
            }
            else
            {
                currentWorkspace = null;
            }
        }
        else
        {
            currentWorkspace = workspace.getWorkspaceFolder(document.uri);
        }

        return currentWorkspace?.uri.fsPath ?? documentDirname;
    }

    /**
     * Loads a converter according to the settings.
     *
     * @param documentRoot
     * The path to the root of the document-context.
     *
     * @param document
     * The document to convert.
     *
     * @returns
     * A converter generated according to the settings.
     */
    protected async LoadConverter(documentRoot: string, document: TextDocument): Promise<Converter>
    {
        let converter = new Converter(documentRoot, new Document(await this.LoadParser(), document));
        let metaTemplate = converter.Document.Attributes[AttributeKey.MetaTemplate] as string ?? Settings.Default.MetaTemplate;
        let headerTemplate = converter.Document.Attributes[AttributeKey.HeaderTemplate] as string ?? Settings.Default.HeaderTemplate;
        let footerTemplate = converter.Document.Attributes[AttributeKey.FooterTemplate] as string ?? Settings.Default.FooterTemplate;
        converter.ChromiumExecutablePath = Settings.Default.ChromiumExecutablePath ?? converter.ChromiumExecutablePath;
        converter.ChromiumArgs = Settings.Default.ChromiumArgs ?? converter.ChromiumArgs;
        converter.Document.Quality = Settings.Default.ConversionQuality;
        Object.assign(converter.Document.Attributes, Settings.Default.Attributes);
        converter.Document.Locale = new CultureInfo(Settings.Default.Locale);

        if (AttributeKey.DateFormat in converter.Document.Attributes)
        {
            converter.Document.DefaultDateFormat = (converter.Document.Attributes[AttributeKey.DateFormat] as string) ?? null;
        }
        else
        {
            converter.Document.DefaultDateFormat = Settings.Default.DefaultDateFormat ?? null;
        }

        for (let key in Settings.Default.DateFormats)
        {
            converter.Document.DateFormats[key] = Settings.Default.DateFormats[key];
        }

        converter.Document.Paper = Settings.Default.PaperFormat;
        converter.Document.Meta.Content = await this.LoadFragment(converter, metaTemplate) ?? converter.Document.Meta.Content;
        converter.Document.HeaderFooterEnabled = Settings.Default.HeaderFooterEnabled;
        converter.Document.Header.Content = await this.LoadFragment(converter, headerTemplate) ?? converter.Document.Header.Content;
        converter.Document.Footer.Content = await this.LoadFragment(converter, footerTemplate) ?? converter.Document.Footer.Content;

        for (
            let entry of [
                [converter.Document.Header, AttributeKey.Header, Settings.Default.HeaderContent],
                [converter.Document.Footer, AttributeKey.Footer, Settings.Default.FooterContent]
            ] as Array<[RunningBlock, AttributeKey, IRunningBlockContent]>)
        {
            let runningBlock = entry[0];
            let attributeContent = converter.Document.Attributes[entry[1]] as IRunningBlockContent;
            let settingContent = entry[2];
            runningBlock.Left = attributeContent?.Left ?? settingContent?.Left ?? "";
            runningBlock.Center = attributeContent?.Center ?? settingContent?.Center ?? "";
            runningBlock.Right = attributeContent?.Right ?? settingContent?.Right ?? "";
        }

        try
        {
            if (Settings.Default.Template)
            {
                converter.Document.Template = (await readFile(resolve(documentRoot ?? ".", Settings.Default.Template))).toString();
            }
            else if (Settings.Default.SystemParserEnabled)
            {
                converter.Document.Template = (await readFile(Resources.Files.Get("SystemTemplate"))).toString();
            }
        }
        catch (exception)
        {
            if (
                typeof exception === "object" &&
                "path" in exception)
            {
                throw new FileException(null, (exception as any).path);
            }
            else
            {
                throw exception;
            }
        }

        if (Settings.Default.DefaultStylesEnabled)
        {
            converter.Document.StyleSheets.push(new StyleSheet(Resources.Files.Get("SystemStyle"), InsertionType.Include));
        }

        if (Settings.Default.SystemParserEnabled)
        {
            let mdExtensions = new MarkdownContributions();
            let assets: Asset[] = [];

            for (let uri of mdExtensions.PreviewStyles)
            {
                let styleSheet = new StyleSheet(uri.fsPath);
                assets.push(styleSheet);
                converter.Document.StyleSheets.push(styleSheet);
            }

            for (let uri of mdExtensions.PreviewScripts)
            {
                let script = new WebScript(uri.fsPath);
                assets.push(script);
                converter.Document.Scripts.push(script);
            }

            for (let asset of assets)
            {
                asset.InsertionType = asset.URLType === AssetURLType.Link ?
                    InsertionType.Link :
                    InsertionType.Include;
            }
        }

        if (Settings.Default.HighlightStyle !== "None")
        {
            if (Settings.Default.HighlightStyle === "Default")
            {
                if (!Settings.Default.SystemParserEnabled)
                {
                    converter.Document.StyleSheets.push(new StyleSheet(Resources.Files.Get("DefaultHighlight")));
                }
            }
            else
            {
                converter.Document.StyleSheets.push(
                    new StyleSheet(join(Resources.Files.Get("HighlightJSStylesDir"), Settings.Default.HighlightStyle + ".css")));
            }
        }

        this.LoadAssets(
            Settings.Default.StyleSheets,
            converter.Document.StyleSheets,
            (path, insertionType) => new StyleSheet(path, insertionType, converter.DocumentRoot),
            Settings.Default.StyleSheetInsertion);

        this.LoadAssets(
            Settings.Default.Scripts,
            converter.Document.Scripts,
            (path, insertionType) => new WebScript(path, insertionType, converter.DocumentRoot),
            Settings.Default.ScriptInsertion);

        for (let urlType of [AssetURLType.AbsolutePath, AssetURLType.RelativePath, AssetURLType.Link])
        {
            if (urlType in Settings.Default.PictureInsertion)
            {
                converter.Document.PictureInsertionTypes.set(urlType, Settings.Default.PictureInsertion[urlType]);
            }
        }

        return converter;
    }

    /**
     * Adds the assets from the specified {@link source `source`} to the {@link target `target`}.
     *
     * @param source
     * The assets to load.
     *
     * @param target
     * The asset-list to add the {@link source `source`}-assets to.
     *
     * @param loader
     * A component for loading assets.
     *
     * @param insertionTypes
     * The insertion-types to use based on the paths of the assets.
     */
    protected LoadAssets(source: Record<string, InsertionType>, target: Asset[], loader: AssetLoader, insertionTypes: Partial<Record<AssetURLType, InsertionType>>): void
    {
        for (let entry of Object.entries(source))
        {
            let asset = loader(entry[0], entry[1]);

            if (
                asset.InsertionType === InsertionType.Default &&
                asset.URLType in insertionTypes)
            {
                asset.InsertionType = insertionTypes[asset.URLType];
            }

            target.push(asset);
        }
    }

    /**
     * Loads a parser according to the settings.
     *
     * @returns
     * The markdown-parser.
     */
    protected async LoadParser(): Promise<MarkdownIt>
    {
        let parser: MarkdownIt;

        if (Settings.Default.SystemParserEnabled)
        {
            if (!this.Extension.VSCodeParser)
            {
                await this.Extension.EnableSystemParser();
            }

            parser = cloneDeep(this.Extension.VSCodeParser);
            parser.normalizeLink = (link: string) => link;
            parser.normalizeLinkText = (link: string) => link;
            parser.renderer.rules[ConversionRunner.headingRule] = new MarkdownIt().renderer.rules[ConversionRunner.headingRule];
        }
        else
        {
            parser = new MarkdownIt({
                html: true,
                highlight: (subject, language) =>
                {
                    if (Settings.Default.HighlightStyle !== "None")
                    {
                        subject = highlight(language, subject, true).value;
                    }
                    else
                    {
                        subject = parser.utils.escapeHtml(subject);
                    }

                    return `<pre class="hljs"><code><div>${subject}</div></code></pre>`;
                }
            });
        }

        parser.validateLink = () => true;
        parser.use(Anchor);

        if (Settings.Default.TocSettings)
        {
            parser.use(
                TOC,
                {
                    includeLevel: Settings.Default.TocSettings.Levels.toArray(),
                    containerClass: Settings.Default.TocSettings.Class,
                    markerPattern: Settings.Default.TocSettings.Indicator,
                    listType: Settings.Default.TocSettings.ListType === ListType.Ordered ? "ol" : "ul"
                });
        }

        parser.use(checkbox);

        if (Settings.Default.EmojiType !== null && Settings.Default.EmojiType !== undefined)
        {
            parser.use(emoji);

            parser.renderer.rules["emoji"] = (token, id) =>
            {
                switch (Settings.Default.EmojiType)
                {
                    case EmojiType.None:
                        return `:${token[id].markup}:`;
                    case EmojiType.Native:
                        return token[id].content;
                    case EmojiType.Twitter:
                        return parse(token[id].content);
                    case EmojiType.GitHub:
                        return "<img " +
                            'class="emoji" ' +
                            `title=":${token[id].markup}:" ` +
                            `alt=":${token[id].markup}:" ` +
                            `src="https://github.githubassets.com/images/icons/emoji/unicode/${convert.toCodePoint(token[id].content).toLowerCase()}.png" ` +
                            'style="vertical-align: middle; " />';
                }
            };
        }

        parser.use(
            markdownContainer,
            "markdown-converter",
            {
                validate(name: string)
                {
                    return name.trim().length > 0;
                },
                render(token: Token[], id: number)
                {
                    if (token[id].info.trim() !== "")
                    {
                        return `<div class="${token[id].info.trim()}">\n`;
                    }
                    else
                    {
                        return "</div>\n";
                    }
                }
            });

        parser.use(
            markdownInclude,
            {
                getRootDir: (options: any, state: StateCore) =>
                {
                    return state.env[EnvironmentKey.RootDir] ?? ".";
                }
            });

        return parser;
    }

    /**
     * Loads the content of a fragment.
     *
     * @param converter
     * The converter to load the fragment for.
     *
     * @param source
     * Either the path to a file to load the source from or the source of the fragment.
     *
     * @returns
     * The content of the fragment.
     */
    protected async LoadFragment(converter: Converter, source: string): Promise<string>
    {
        let fileName: string;

        if (
            source &&
            await pathExists(
                (fileName = resolve(converter.DocumentRoot, source))))
        {
            return (await readFile(fileName)).toString();
        }
        else
        {
            return source;
        }
    }
}
