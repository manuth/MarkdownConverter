import { CultureInfo } from "@manuth/resource-manager";
import { TempDirectory } from "@manuth/temp-files";
import { pathExists, readFile } from "fs-extra";
import { highlight } from "highlight.js";
import cloneDeep = require("lodash.clonedeep");
import MarkdownIt = require("markdown-it");
import anchor = require("markdown-it-anchor");
import checkbox = require("markdown-it-checkbox");
import emoji = require("markdown-it-emoji");
import toc = require("markdown-it-table-of-contents");
import format = require("string-template");
import twemoji = require("twemoji");
import { dirname, isAbsolute, join, resolve } from "upath";
import { CancellationToken, Progress, TextDocument, window, workspace, WorkspaceFolder } from "vscode";
import { ConversionType } from "../../Conversion/ConversionType";
import { Converter } from "../../Conversion/Converter";
import { IConvertedFile } from "../../Conversion/IConvertedFile";
import { MarkdownConverterExtension } from "../../MarkdownConverterExtension";
import { Resources } from "../../Properties/Resources";
import { Settings } from "../../Properties/Settings";
import { StyleSheet } from "../Documents/Assets/StyleSheet";
import { WebScript } from "../Documents/Assets/WebScript";
import { Document } from "../Documents/Document";
import { EmojiType } from "../Documents/EmojiType";
import { ListType } from "../Documents/ListType";
import { Slugifier } from "../Documents/Slugifier";
import { MarkdownContributions } from "../Extensibility/MarkdownContributions";
import { FileException } from "../IO/FileException";
import { PatternResolver } from "../IO/PatternResolver";
import { OperationCancelledException } from "../OperationCancelledException";
import { IProgressState } from "./IProgressState";

/**
 * Provides the functionality to load settings and run a `Converter`.
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
     * Initializes a new instance of the `ConversionRunner` class.
     *
     * @param extension
     * The extension the runner belongs to.
     */
    public constructor(extension: MarkdownConverterExtension)
    {
        this.extension = extension;
    }

    /**
     * Gets the extension the runner belongs to.
     */
    public get Extension(): MarkdownConverterExtension
    {
        return this.extension;
    }

    /**
     * Gets the extension the runner belongs to.
     */
    public set Extension(value)
    {
        this.extension = value;
    }

    /**
     * Executes the underlying `Converter`.
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
     * A converter generated by the settings.
     */
    protected async LoadConverter(documentRoot: string, document: TextDocument): Promise<Converter>
    {
        let dateFormatKey = "DateFormat";
        let converter = new Converter(documentRoot, new Document(document, await this.LoadParser()));
        let headerTemplate = converter.Document.Attributes["HeaderTemplate"] as string;
        let footerTemplate = converter.Document.Attributes["FooterTemplate"] as string;
        converter.Document.Quality = Settings.Default.ConversionQuality;
        Object.assign(converter.Document.Attributes, Settings.Default.Attributes);
        converter.Document.Locale = new CultureInfo(Settings.Default.Locale);

        if (dateFormatKey in converter.Document.Attributes)
        {
            converter.Document.DefaultDateFormat = (converter.Document.Attributes["DateFormat"] as string) ?? null;
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
        converter.Document.HeaderFooterEnabled = Settings.Default.HeaderFooterEnabled;

        if (
            headerTemplate &&
            await pathExists(resolve(converter.DocumentRoot, headerTemplate)))
        {
            converter.Document.Header.Content = (await readFile(headerTemplate)).toString();
        }
        else
        {
            converter.Document.Header.Content = Settings.Default.HeaderTemplate;
        }

        if (
            footerTemplate &&
            await pathExists(resolve(converter.DocumentRoot, footerTemplate)))
        {
            converter.Document.Footer.Content = (await readFile(footerTemplate)).toString();
        }
        else
        {
            converter.Document.Footer.Content = Settings.Default.FooterTemplate;
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
            converter.Document.StyleSheets.push(new StyleSheet(Resources.Files.Get("SystemStyle")));
        }

        if (Settings.Default.SystemParserEnabled)
        {
            let mdExtensions = new MarkdownContributions(this.Extension.Context.extensionPath);

            for (let styleSheet of mdExtensions.previewStyles)
            {
                converter.Document.StyleSheets.push(new StyleSheet(styleSheet.fsPath));
            }

            for (let script of mdExtensions.previewScripts)
            {
                converter.Document.Scripts.push(new WebScript(script.fsPath));
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

        for (let styleSheet of Settings.Default.StyleSheets)
        {
            converter.Document.StyleSheets.push(new StyleSheet(styleSheet));
        }

        return converter;
    }

    /**
     * Loads a parser according to the settings.
     *
     * @returns
     * The parser.
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
                        return twemoji.parse(token[id].content);
                    case EmojiType.GitHub:
                        return "<img " +
                            'class="emoji" ' +
                            `title=":${token[id].markup}:" ` +
                            `alt=":${token[id].markup}:" ` +
                            `src="https://github.githubassets.com/images/icons/emoji/unicode/${twemoji.convert.toCodePoint(token[id].content).toLowerCase()}.png" ` +
                            'align="absmiddle" />';
                }
            };
        }

        return parser;
    }
}
