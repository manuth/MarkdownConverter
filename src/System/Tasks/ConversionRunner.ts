import { dirname, join, normalize, parse, relative, resolve } from "path";
import clone = require("clone");
import { CultureInfo } from "culture-info";
import template = require("es6-template-string");
import { ensureDir, pathExists, readFile } from "fs-extra";
import { highlight } from "highlight.js";
import MarkdownIt = require("markdown-it");
import anchor = require("markdown-it-anchor");
import checkbox = require("markdown-it-checkbox");
import emoji = require("markdown-it-emoji");
import toc = require("markdown-it-table-of-contents");
import format = require("string-template");
import twemoji = require("twemoji");
import { Progress, TextDocument, window, workspace, WorkspaceFolder } from "vscode";
import { ConversionType } from "../../Conversion/ConversionType";
import { Converter } from "../../Conversion/Converter";
import { IConvertedFile } from "../../Conversion/IConvertedFile";
import { MarkdownConverterExtension } from "../../MarkdownConverterExtension";
import { Resources } from "../../Properties/Resources";
import { Settings } from "../../Properties/Settings";
import { Utilities } from "../../Utilities";
import { Document } from "../Documents/Document";
import { EmojiType } from "../Documents/EmojiType";
import { ListType } from "../Documents/ListType";
import { Slugifier } from "../Documents/Slugifier";
import { MarkdownContributions } from "../Extensibility/MarkdownContributions";
import { FileException } from "../IO/FileException";
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
     * @param fileReporter
     * A component for reporting converted files.
     */
    public async Execute(document: TextDocument, progressReporter?: Progress<IProgressState>, fileReporter?: Progress<IConvertedFile>): Promise<void>
    {
        let tasks: Array<Promise<void>> = [];
        let converter: Converter;
        let workspaceRoot: string;
        let documentFolder = document.isUntitled ? null : dirname(document.fileName);
        let parsedSourcePath = parse(document.fileName);
        let currentWorkspace: WorkspaceFolder;

        if (!fileReporter)
        {
            fileReporter = {
                report()
                { }
            };
        }

        if (!progressReporter)
        {
            progressReporter = {
                report()
                { }
            };
        }

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

        workspaceRoot = currentWorkspace?.uri.fsPath ?? null;
        converter = await this.LoadConverter(workspaceRoot ?? documentFolder, document);
        await converter.Initialize(progressReporter);

        for (let type of Settings.Default.ConversionType)
        {
            tasks.push(
                (async () =>
                {
                    let destinationPath: string;
                    let workspaceFolder: string;
                    let workspaceFolderRequired: boolean;
                    let extension: string;
                    let context: any;

                    progressReporter.report(
                        {
                            message: format(Resources.Resources.Get("Progress.ConversionStarting"), ConversionType[type])
                        });

                    switch (type)
                    {
                        case ConversionType.SelfContainedHTML:
                        case ConversionType.HTML:
                            extension = "html";
                            break;
                        case ConversionType.JPEG:
                            extension = "jpg";
                            break;
                        case ConversionType.PNG:
                            extension = "png";
                            break;
                        case ConversionType.PDF:
                            extension = "pdf";
                            break;
                    }

                    workspaceFolder = workspaceRoot ?? documentFolder ?? null;

                    context =
                        new class
                        {
                            /**
                             * The name of the directory of the document.
                             */
                            public dirname: string;

                            /**
                             * The name of the document-file.
                             */
                            public filename: string;

                            /**
                             * The name of the document-file without extension.
                             */
                            public basename: string;

                            /**
                             * The name of the extension of the destination-type.
                             */
                            public extension: string;

                            /**
                             * Initializes a new instance of the class.
                             */
                            public constructor()
                            {
                                this.filename = parsedSourcePath.base;
                                this.basename = parsedSourcePath.name;
                                this.extension = extension;

                                if (workspaceRoot !== null && documentFolder !== null)
                                {
                                    this.dirname = relative(workspaceRoot, documentFolder);
                                }
                                else
                                {
                                    this.dirname = "";
                                }
                            }
                        }();

                    progressReporter.report(
                        {
                            message: Resources.Resources.Get("Progress.ResolveFileName")
                        });

                    do
                    {
                        try
                        {
                            destinationPath = normalize(template(Settings.Default.DestinationPattern, context));
                        }
                        catch
                        {
                            try
                            {
                                destinationPath = normalize(template(Settings.Default.DestinationPattern, { ...context, workspaceFolder }));
                                workspaceFolderRequired = !workspaceFolder;
                            }
                            catch (exception)
                            {
                                throw exception;
                            }
                        }

                        if (workspaceFolderRequired)
                        {
                            while (workspaceFolder === null || workspaceFolder === undefined)
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
                        }
                    }
                    while (workspaceFolderRequired);

                    await ensureDir(dirname(destinationPath));
                    await converter.Start(type, destinationPath, progressReporter);

                    progressReporter.report(
                        {
                            message: format(Resources.Resources.Get("Progress.ConverterFinished"), ConversionType[type])
                        });

                    fileReporter.report(
                        {
                            Type: type,
                            FileName: destinationPath
                        });
                })());
        }

        await Promise.all(tasks);
        await converter.Dispose();
    }

    /**
     * Loads a converter according to the settings.
     *
     * @param workspaceRoot
     * The path to the root of the workspace of the document.
     *
     * @param document
     * The document to convert.
     *
     * @returns
     * A converter generated by the settings.
     */
    protected async LoadConverter(workspaceRoot: string, document: TextDocument): Promise<Converter>
    {
        if (!this.Extension.VSCodeParser)
        {
            await this.Extension.EnableSystemParser();
        }

        let converter = new Converter(workspaceRoot, new Document(document, await this.LoadParser()));
        let headerTemplate = converter.Document.Attributes["HeaderTemplate"] as string;
        let footerTemplate = converter.Document.Attributes["FooterTemplate"] as string;
        converter.Document.Quality = Settings.Default.ConversionQuality;
        Object.assign(converter.Document.Attributes, Settings.Default.Attributes);
        converter.Document.Attributes.Author = converter.Document.Attributes.Author || await Utilities.GetFullName();
        converter.Document.Locale = new CultureInfo(Settings.Default.Locale);
        converter.Document.DateFormat = Settings.Default.DateFormat;
        converter.Document.Paper = Settings.Default.PaperFormat;
        converter.Document.HeaderFooterEnabled = Settings.Default.HeaderFooterEnabled;

        if (
            headerTemplate &&
            await pathExists(resolve(converter.WorkspaceRoot, headerTemplate)))
        {
            converter.Document.Header.Content = (await readFile(headerTemplate)).toString();
        }
        else
        {
            converter.Document.Header.Content = Settings.Default.HeaderTemplate;
        }

        if (
            footerTemplate &&
            await pathExists(resolve(converter.WorkspaceRoot, footerTemplate)))
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
                converter.Document.Template = (await readFile(resolve(workspaceRoot || ".", Settings.Default.Template))).toString();
            }
            else if (Settings.Default.SystemParserEnabled)
            {
                converter.Document.Template = (await readFile(Resources.Files.Get("SystemTemplate"))).toString();
            }
        }
        catch (exception)
        {
            if (
                exception instanceof Error &&
                "path" in exception)
            {
                throw new FileException(null, (exception as any)["path"]);
            }
            else
            {
                throw exception;
            }
        }

        if (Settings.Default.SystemParserEnabled)
        {
            let mdExtensions = new MarkdownContributions(this.Extension.Context.extensionPath);

            for (let styleSheet of mdExtensions.previewStyles)
            {
                converter.Document.StyleSheets.push(styleSheet.fsPath);
            }

            for (let script of mdExtensions.previewScripts)
            {
                converter.Document.Scripts.push(script.fsPath);
            }
        }

        if (Settings.Default.HighlightStyle !== "None")
        {
            if (Settings.Default.HighlightStyle === "Default")
            {
                if (!Settings.Default.SystemParserEnabled)
                {
                    converter.Document.StyleSheets.push(Resources.Files.Get("DefaultHighlight"));
                }
            }
            else
            {
                converter.Document.StyleSheets.push(join(Resources.Files.Get("HighlightJSStylesDir"), Settings.Default.HighlightStyle + ".css"));
            }
        }

        for (let styleSheet of Settings.Default.StyleSheets)
        {
            converter.Document.StyleSheets.push(styleSheet);
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
            parser = clone(this.Extension.VSCodeParser);
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

        if (Settings.Default.EmojiType)
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
