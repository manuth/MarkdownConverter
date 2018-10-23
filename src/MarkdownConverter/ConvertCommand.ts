import * as ChildProcess from "child_process";
import clone = require("clone");
import CultureInfo from "culture-info";
import * as FileSystem from "fs-extra";
import * as HighlightJs from "highlight.js";
import * as MarkdownIt from "markdown-it";
import * as Anchor from "markdown-it-anchor";
import * as Checkbox from "markdown-it-checkbox";
import * as MarkdownItEmoji from "markdown-it-emoji";
import * as MarkdownItToc from "markdown-it-table-of-contents";
import * as Path from "path";
import * as Puppeteer from "puppeteer";
import * as Format from "string-template";
import * as Transliteration from "transliteration";
import * as TwEmoji from "twemoji";
import { isNullOrUndefined } from "util";
import { ProgressLocation, TextDocument, window, workspace, WorkspaceFolder } from "vscode";
import { Extension } from "../extension";
import { ResourceManager } from "../Properties/ResourceManager";
import { Settings } from "../Properties/Settings";
import { Document } from "../System/Drawing/Document";
import { EmojiType } from "../System/Drawing/EmojiType";
import { ListType } from "../System/Drawing/ListType";
import { Slugifier } from "../System/Drawing/Slugifier";
import { Exception } from "../System/Exception";
import { FileException } from "../System/IO/FileException";
import { StringUtils } from "../System/Text/StringUtils";
import { Command } from "./Command";
import { ConversionType } from "./ConversionType";
import { Converter } from "./Converter";
import { DestinationOrigin } from "./DestinationOrigin";
import { getMarkdownExtensionContributions } from "./MarkdownExtensions";
import { MarkdownFileNotFoundException } from "./MarkdownFileNotFoundException";

/**
 * Provides a command for converting a markdown-document.
 */
export class ConvertCommand extends Command
{
    /**
     * Initializes a new instance of the `ConvertCommand` class.
     * 
     * @param extension
     * The extension the command belongs to.
     */
    public constructor(extension: Extension)
    {
        super(extension);
    }

    /**
     * Loads a converter according to the settings.
     * 
     * @param documentRoot
     * The path to the root of the document.
     * 
     * @param textDocument
     * The document to convert.
     * 
     * @returns
     * A converter generated by the settings.
     */
    protected async LoadConverter(documentRoot: string, textDocument: TextDocument): Promise<Converter>
    {
        let converter = new Converter(documentRoot, new Document(textDocument, await this.LoadParser()));
        converter.Document.Quality = Settings.Default.ConversionQuality;

        Object.assign(converter.Document.Attributes, Settings.Default.Attributes);

        converter.Document.Locale = new CultureInfo(Settings.Default.Locale);
        converter.Document.DateFormat = Settings.Default.DateFormat;

        converter.Document.Paper = Settings.Default.PaperFormat;

        converter.Document.HeaderFooterEnabled = Settings.Default.HeaderFooterEnabled;
        converter.Document.Header.Content = Settings.Default.HeaderTemplate;
        converter.Document.Footer.Content = Settings.Default.FooterTemplate;

        try
        {
            if (Settings.Default.Template)
            {
                converter.Document.Template = (await FileSystem.readFile(Path.resolve(documentRoot || ".", Settings.Default.Template))).toString();
            }
            else if (Settings.Default.SystemParserEnabled)
            {
                converter.Document.Template = (await FileSystem.readFile(ResourceManager.Files.Get("SystemTemplate"))).toString();
            }
        }
        catch (exception)
        {
            if (
                exception instanceof Error &&
                "path" in exception)
            {
                throw new FileException(null, exception["path"]);
            }
            else
            {
                throw exception;
            }
        }

        if (Settings.Default.SystemParserEnabled)
        {
            let mdExtensions = getMarkdownExtensionContributions(this.Extension.Context);

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
                    converter.Document.StyleSheets.push(ResourceManager.Files.Get("DefaultHighlight"));
                }
            }
            else
            {
                converter.Document.StyleSheets.push(Path.join(ResourceManager.Files.Get("HighlightJSStylesDir"), Settings.Default.HighlightStyle + ".css"));
            }
        }

        for (let styleSheet of Settings.Default.StyleSheets)
        {
            if (!Path.isAbsolute(styleSheet))
            {
                styleSheet = Path.resolve(documentRoot || ".", styleSheet);
            }

            converter.Document.StyleSheets.push(styleSheet);
        }

        return converter;
    }

    /**
     * Loads a parser according to the settings.
     */
    protected async LoadParser(): Promise<MarkdownIt.MarkdownIt>
    {
        let parser: MarkdownIt.MarkdownIt;
        let slugify = text =>
            Transliteration.slugify(
                text,
                {
                    lowercase: true,
                    separator: "-",
                    ignore: []
                });

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
                        subject = HighlightJs.highlight(language, subject, true).value;
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

        Anchor(
            parser,
            {
                slugify
            });

        if (Settings.Default.TocSettings)
        {
            let slugifier = new Slugifier();
            parser.use(
                MarkdownItToc,
                {
                    includeLevel: Settings.Default.TocSettings.Levels.toArray(),
                    containerClass: Settings.Default.TocSettings.Class,
                    markerPattern: Settings.Default.TocSettings.Indicator,
                    listType: Settings.Default.TocSettings.ListType === ListType.Ordered ? "ol" : "ul",
                    slugify: heading => slugifier.CreateSlug(heading)
                });
        }

        parser.use(Checkbox);

        if (Settings.Default.EmojiType)
        {
            parser.use(MarkdownItEmoji);
            parser.renderer.rules["emoji"] = (token, id) =>
            {
                switch (Settings.Default.EmojiType)
                {
                    case EmojiType.None:
                        return token[id].markup;
                    case EmojiType.Native:
                        return token[id].content;
                    case EmojiType.Twitter:
                        return TwEmoji.parse(token[id].content);
                    case EmojiType.GitHub:
                        return "<img " +
                            'class="emoji" ' +
                            `title=":${token[id].markup}:" ` +
                            `alt=":${token[id].markup}:" ` +
                            `src="https://assets-cdn.github.com/images/icons/emoji/unicode/${StringUtils.UTF8CharToCodePoints(token[id].content).toString(16).toLowerCase()}.png" ` +
                            'align="absmiddle" />';
                }
            };
        }

        return parser;
    }

    /**
     * Tries to find a markdown-file.
     */
    protected GetMarkdownDocument(): TextDocument
    {
        if (window.activeTextEditor && (window.activeTextEditor.document.languageId === "markdown" || Settings.Default.IgnoreLanguageMode))
        {
            return window.activeTextEditor.document;
        }

        for (let textEditor of window.visibleTextEditors)
        {
            if (textEditor.document.languageId === "markdown")
            {
                return textEditor.document;
            }
        }

        throw new MarkdownFileNotFoundException();
    }

    public async Execute()
    {
        try
        {
            if (await FileSystem.pathExists(Puppeteer.executablePath()))
            {
                let destinationPath: string;
                let textDocument = this.GetMarkdownDocument();
                let documentFolder = textDocument.isUntitled ? null : Path.dirname(textDocument.fileName);
                let currentWorkspace: WorkspaceFolder;

                if (textDocument.isUntitled)
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
                    currentWorkspace = (workspace.workspaceFolders || []).find(
                        (workspaceFolder) =>
                        {
                            let workspaceParts = workspaceFolder.uri.fsPath.split(Path.sep);
                            let documentParts = textDocument.uri.fsPath.split(Path.sep);

                            return workspaceParts.every(
                                (value, index) =>
                                {
                                    return value === documentParts[index];
                                });
                        });
                }

                let workspaceRoot = !isNullOrUndefined(currentWorkspace) ? currentWorkspace.uri.fsPath : null;
                let documentRoot = workspaceRoot || documentFolder;

                if (!Path.isAbsolute(Settings.Default.DestinationPath))
                {
                    let origin: string = null;

                    if (Settings.Default.DestinationOrigin === DestinationOrigin.WorkspaceRoot)
                    {
                        origin = workspaceRoot || documentFolder;
                    }
                    else if (Settings.Default.DestinationOrigin === DestinationOrigin.DocumentFile)
                    {
                        origin = documentFolder || workspaceRoot;
                    }

                    while (isNullOrUndefined(origin))
                    {
                        origin = await window.showInputBox({
                            ignoreFocusOut: true,
                            prompt: ResourceManager.Resources.Get("DestinationPath"),
                            placeHolder: ResourceManager.Resources.Get("DestinationPathExample")
                        });
                    }

                    destinationPath = Path.resolve(origin, Settings.Default.DestinationPath);
                }
                else
                {
                    destinationPath = Settings.Default.DestinationPath;
                }

                let fileName = Path.parse(textDocument.fileName).name;
                let converter = await this.LoadConverter(documentRoot, textDocument);
                let prompts = [];

                await FileSystem.ensureDir(destinationPath);

                for (let type of Settings.Default.ConversionType)
                {
                    let extension: string;

                    switch (type)
                    {
                        case ConversionType.HTML:
                            extension = "html";
                            break;
                        case ConversionType.JPEG:
                            extension = "jpg";
                            break;
                        case ConversionType.PNG:
                            extension = "png";
                            break;
                        default:
                        case ConversionType.PDF:
                            extension = "pdf";
                            break;
                    }

                    let destination = Path.join(destinationPath, `${fileName}.${extension}`);
                    await converter.Start(type, destination);

                    prompts.push(
                        (
                            async () =>
                            {
                                await window.showInformationMessage(
                                    Format(ResourceManager.Resources.Get("SuccessMessage"), ConversionType[type], destination),
                                    ResourceManager.Resources.Get("OpenFileLabel")).then(
                                        (label) =>
                                        {
                                            if (label === ResourceManager.Resources.Get("OpenFileLabel"))
                                            {
                                                switch (process.platform)
                                                {
                                                    case "win32":
                                                        ChildProcess.exec(`"${destination}"`);
                                                        break;
                                                    case "darwin":
                                                        ChildProcess.exec(`bash -c 'open "${destination}"'`);
                                                        break;
                                                    case "linux":
                                                        ChildProcess.exec(`bash -c 'xdg-open "${destination}"'`);
                                                        break;
                                                    default:
                                                        window.showWarningMessage(ResourceManager.Resources.Get("UnsupportedPlatformException"));
                                                        break;
                                                }
                                            }
                                        });
                            })());
                }

                await Promise.all(prompts);
            }
            else if (
                await window.showInformationMessage(
                    ResourceManager.Resources.Get("UpdateMessage"),
                    ResourceManager.Resources.Get<string>("Yes"),
                    ResourceManager.Resources.Get<string>("No")) === ResourceManager.Resources.Get<string>("Yes"))
            {
                let revision = require(Path.join("..", "..", "node_modules", "puppeteer", "package.json"))["puppeteer"]["chromium_revision"];
                let success = false;

                do
                {
                    await window.withProgress(
                        {
                            location: ProgressLocation.Notification,
                            title: Format(ResourceManager.Resources.Get("UpdateRunning"), revision)
                        },
                        async (reporter) =>
                        {
                            try
                            {
                                let progress = 0;
                                let browserFetcher = (Puppeteer as any).createBrowserFetcher();

                                await browserFetcher.download(
                                    revision,
                                    (downloadBytes, totalBytes) =>
                                    {
                                        let newProgress = Math.floor((downloadBytes / totalBytes) * 100);

                                        if (newProgress > progress)
                                        {
                                            reporter.report({
                                                increment: newProgress - progress
                                            });

                                            progress = newProgress;
                                        }
                                    });

                                window.showInformationMessage(ResourceManager.Resources.Get("UpdateSuccess"));
                                success = true;
                            }
                            catch
                            {
                                success = false;
                            }
                        });
                }
                while (
                    !await FileSystem.pathExists(Puppeteer.executablePath()) &&
                    !success &&
                    await window.showWarningMessage(
                        ResourceManager.Resources.Get("UpdateFailed"),
                        ResourceManager.Resources.Get("Yes"),
                        ResourceManager.Resources.Get("No")) === ResourceManager.Resources.Get("Yes"));
            }
        }
        catch (exception)
        {
            let message: string;

            if (exception instanceof Exception)
            {
                message = exception.Message;
            }
            else
            {
                throw exception;
            }

            window.showErrorMessage(message);
        }
    }
}