import { CultureInfo } from "@manuth/resource-manager";
import { TempDirectory } from "@manuth/temp-files";
import { readFile } from "fs-extra";
import { highlight } from "highlight.js";
import cloneDeep = require("lodash.clonedeep");
import MarkdownIt = require("markdown-it");
import anchor = require("markdown-it-anchor");
import checkbox = require("markdown-it-checkbox");
import emoji = require("markdown-it-emoji");
import toc = require("markdown-it-table-of-contents");
import format = require("string-template");
import { convert, parse } from "twemoji";
import { dirname, isAbsolute, join, resolve } from "upath";
import { CancellationToken, Progress, TextDocument, window, workspace, WorkspaceFolder } from "vscode";
import { ConversionType } from "../../Conversion/ConversionType";
import { Converter } from "../../Conversion/Converter";
import { IConvertedFile } from "../../Conversion/IConvertedFile";
import { MarkdownConverterExtension } from "../../MarkdownConverterExtension";
import { Resources } from "../../Properties/Resources";
import { Settings } from "../../Properties/Settings";
import { Asset } from "../Documents/Assets/Asset";
import { AssetURLType } from "../Documents/Assets/AssetURLType";
import { InsertionType } from "../Documents/Assets/InsertionType";
import { StyleSheet } from "../Documents/Assets/StyleSheet";
import { WebScript } from "../Documents/Assets/WebScript";
import { AttributeKey } from "../Documents/AttributeKey";
import { Document } from "../Documents/Document";
import { EmojiType } from "../Documents/EmojiType";
import { ListType } from "../Documents/ListType";
import { Slugifier } from "../Documents/Slugifier";
import { MarkdownContributions } from "../Extensibility/MarkdownContributions";
import { FileException } from "../IO/FileException";
import { PatternResolver } from "../IO/PatternResolver";
import { OperationCancelledException } from "../OperationCancelledException";
import { AssetLoader } from "./AssetLoader";
import { IProgressState } from "./IProgressState";

/**
 * Provides the functionality to load settings and run a {@link Converter `Converter`}.
 */
export class ConversionRunner
{
    /**
     * The extension the runner belongs to.
     */
    private extension: MarkdownConverterExtension;

    /**
     * The workspace-folder which has been chosen by the user.
     */
    private lastChosenWorkspaceFolder: string;

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
            let workspaceFolder: string;
            let documentRoot: string;
            let documentDirname = document.isUntitled ? null : dirname(document.fileName);
            let currentWorkspace: WorkspaceFolder;

            if (document.isUntitled)
            {
                if ((workspace.workspaceFolders || []).length === 1)
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

            patternResolver = new PatternResolver(Settings.Default.DestinationPattern, progressReporter);
            workspaceFolder = currentWorkspace?.uri.fsPath ?? documentDirname;

            if (workspaceFolder === null)
            {
                if (
                    patternResolver.Variables.includes("workspaceFolder") ||
                    !isAbsolute(patternResolver.Pattern))
                {
                    while (workspaceFolder === null)
                    {
                        if (!(cancellationToken?.isCancellationRequested ?? false))
                        {
                            this.lastChosenWorkspaceFolder = workspaceFolder = await (
                                window.showInputBox(
                                    {
                                        ignoreFocusOut: true,
                                        prompt: Resources.Resources.Get("DestinationPath"),
                                        value: this.lastChosenWorkspaceFolder || undefined,
                                        placeHolder: Resources.Resources.Get("DestinationPathExample")
                                    }));
                        }
                        else
                        {
                            throw new OperationCancelledException();
                        }
                    }

                    documentRoot = workspaceFolder;
                }
                else
                {
                    tempDir = new TempDirectory();
                    documentRoot = tempDir.FullName;
                }
            }
            else
            {
                documentRoot = workspaceFolder;
            }

            converter = await this.LoadConverter(documentRoot, document);
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

                            let destinationPath = patternResolver.Resolve(documentRoot, document, type, workspaceFolder);

                            if (
                                !isAbsolute(destinationPath) &&
                                !patternResolver.Variables.includes("workspaceFolder"))
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
        }
        else
        {
            throw new OperationCancelledException();
        }
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
        let dateFormatKey = "DateFormat";
        let converter = new Converter(documentRoot, new Document(await this.LoadParser(), document));
        let metaTemplate = converter.Document.Attributes[AttributeKey.MetaTemplate] as string ?? Settings.Default.MetaTemplate;
        let headerTemplate = converter.Document.Attributes[AttributeKey.HeaderTemplate] as string ?? Settings.Default.HeaderTemplate;
        let footerTemplate = converter.Document.Attributes[AttributeKey.FooterTemplate] as string ?? Settings.Default.FooterTemplate;
        converter.ChromiumExecutablePath = Settings.Default.ChromiumExecutablePath ?? converter.ChromiumExecutablePath;
        converter.Document.Quality = Settings.Default.ConversionQuality;
        Object.assign(converter.Document.Attributes, Settings.Default.Attributes);
        converter.Document.Locale = new CultureInfo(Settings.Default.Locale);

        if (dateFormatKey in converter.Document.Attributes)
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
        converter.Document.Meta.Content = await converter.LoadFragment(metaTemplate) ?? converter.Document.Meta.Content;
        converter.Document.HeaderFooterEnabled = Settings.Default.HeaderFooterEnabled;
        converter.Document.Header.Content = await converter.LoadFragment(headerTemplate) ?? converter.Document.Header.Content;
        converter.Document.Footer.Content = await converter.LoadFragment(footerTemplate) ?? converter.Document.Footer.Content;

        for (
            let runningBlockEntry of [
                [converter.Document.Header, Settings.Default.HeaderContent],
                [converter.Document.Footer, Settings.Default.FooterContent]
            ])
        {
            let runningBlock = runningBlockEntry[0];
            let content = runningBlockEntry[1];
            runningBlock.Left = content?.Left ?? "";
            runningBlock.Center = content?.Center ?? "";
            runningBlock.Right = content?.Right ?? "";
        }

        try
        {
            if (Settings.Default.Template)
            {
                converter.Document.Template = (await readFile(resolve(documentRoot || ".", Settings.Default.Template))).toString();
            }
            else if (Settings.Default.SystemParserEnabled)
            {
                converter.Document.Template = (await readFile(Resources.Files.Get("SystemTemplate"))).toString();
            }
        }
        catch (exception)
        {
            if ("path" in exception)
            {
                throw new FileException(null, exception.path);
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
            let mdExtensions = new MarkdownContributions(this.Extension.Context.extensionPath);
            let assets: Asset[] = [];

            for (let uri of mdExtensions.previewStyles)
            {
                let styleSheet = new StyleSheet(uri.fsPath);
                assets.push(styleSheet);
                converter.Document.StyleSheets.push(styleSheet);
            }

            for (let uri of mdExtensions.previewScripts)
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
            (path, insertionType) => new StyleSheet(path, insertionType),
            Settings.Default.StyleSheetInsertion);

        this.LoadAssets(
            Settings.Default.Scripts,
            converter.Document.Scripts,
            (path, insertionType) => new WebScript(path, insertionType),
            Settings.Default.ScriptInsertion);

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
    protected LoadAssets(source: Record<string, InsertionType>, target: Asset[], loader: AssetLoader, insertionTypes: Record<AssetURLType, InsertionType>): void
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
        let anchorSlugifier = new Slugifier();
        let tocSlugifier = new Slugifier();

        if (Settings.Default.SystemParserEnabled)
        {
            if (!this.Extension.VSCodeParser)
            {
                await this.Extension.EnableSystemParser();
            }

            parser = cloneDeep(this.Extension.VSCodeParser);
            parser.normalizeLink = (link: string) => link;
            parser.normalizeLinkText = (link: string) => link;
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

        anchor(
            parser,
            {
                slugify: (heading) => tocSlugifier.CreateSlug(heading)
            });

        if (Settings.Default.TocSettings)
        {
            parser.use(
                toc,
                {
                    includeLevel: Settings.Default.TocSettings.Levels.toArray(),
                    containerClass: Settings.Default.TocSettings.Class,
                    markerPattern: Settings.Default.TocSettings.Indicator,
                    listType: Settings.Default.TocSettings.ListType === ListType.Ordered ? "ol" : "ul",
                    slugify: (heading: string) => anchorSlugifier.CreateSlug(heading)
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

        return parser;
    }
}
