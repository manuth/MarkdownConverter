import CultureInfo from "culture-info";
import * as Dedent from "dedent";
import * as FrontMatter from "front-matter";
import * as FileSystem from "fs-extra";
import * as HighlightJs from "highlight.js";
import * as MarkdownIt from "markdown-it";
import * as Anchor from "markdown-it-anchor";
import * as Checkbox from "markdown-it-checkbox";
import * as MarkdownItEmoji from "markdown-it-emoji";
import * as MarkdownItToc from "markdown-it-table-of-contents";
import * as Mustache from "mustache";
import * as OS from "os";
import * as Path from "path";
import * as TwEmoji from "twemoji";
import { TextDocument } from "vscode";
import * as YAML from "yamljs";
import ResourceManager from "../../Properties/ResourceManager";
import Fullname from "../Fullname";
import DateTimeFormatter from "../Globalization/DateTimeFormatter";
import FileException from "../IO/FileException";
import StringUtils from "../Text/StringUtils";
import YAMLException from "../YAML/YAMLException";
import DocumentFragment from "./DocumentFragment";
import EmojiType from "./EmojiType";
import ListType from "./ListType";
import Paper from "./Paper";
import Renderable from "./Renderable";
import Slugifier from "./Slugifier";
import TocSettings from "./TocSettings";

/**
 * Represents a document.
 */
export default class Document extends Renderable
{
    /**
     * The name of the file represented by this document.
     */
    public fileName: string;

    /**
     * The quality of the document.
     */
    private quality: number = 90;

    /**
     * The type of emojis to use.
     */
    private emojiType: EmojiType = EmojiType.GitHub;

    /**
     * The attributes of the document.
     */
    private attributes: any = {
        Author: Fullname.FullName,
        CreationDate: new Date()
    };

    /**
     * The format to print the date.
     */
    private dateFormat: string = "Default";

    /**
     * The language to print values.
     */
    private locale: CultureInfo = CultureInfo.InvariantCulture;

    /**
     * The layout of the document.
     */
    private paper: Paper = new Paper();

    /**
     * A value indicating whether headers and footers are enabled.
     */
    private headerFooterEnabled: boolean = false;

    /**
     * The header of the document.
     */
    private header: DocumentFragment = new DocumentFragment(this);

    /**
     * The footer of the document.
     */
    private footer: DocumentFragment = new DocumentFragment(this);

    /**
     * The definitions of the table of contents.
     */
    private tocSettings: TocSettings = null;

    /**
     * The template to use for the RenderBody-process.
     */
    private template: string = Dedent(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
                {{{styles}}}
            </head>
            <body>
                <article class="markdown-body">
                    {{{content}}}
                    {{{scripts}}}                
                </article>
            </body>
        </html>`);

    /**
     * A value indicating whether fancy code-blocks are enabled.
     */
    private highlightEnabled: boolean = true;

    /**
     * The stylesheets of the document.
     */
    private styleSheets: string[] = [
        ResourceManager.Files.Get("SystemStyle")
    ];

    public Scripts: string[] = [];

    private markdownParser: MarkdownIt.MarkdownIt | undefined;

    /**
     * Initializes a new instance of the Document class with a file-path and a configuration.
     * 
     * @param document
     * The `TextDocument` to load the info from.
     * 
     * @param config
     * The configuration to set.
     */
    constructor(document: TextDocument, markdown: any)
    {
        super();
        this.RawContent = document.getText();

        if (!document.isUntitled)
        {
            this.FileName = document.fileName;
            this.Attributes.CreationDate = FileSystem.statSync(document.fileName).ctime;
        }
        else
        {
            this.FileName = null;
            this.Attributes.CreationDate = new Date(Date.now());
        }

        this.markdownParser = markdown as MarkdownIt.MarkdownIt;
    }

    /**
     * Gets or sets the name of the file represented by this document.
     */
    public get FileName(): string
    {
        return this.fileName;
    }

    public set FileName(value: string)
    {
        this.fileName = value;
    }

    /**
     * Gets or sets the raw version of the content.
     */
    public get RawContent(): string
    {
        return (
            "---" + OS.EOL +
            YAML.stringify(this.Attributes).trim() + OS.EOL +
            "---" + OS.EOL +
            this.Content);
    }

    public set RawContent(value: string)
    {
        try
        {
            let result = FrontMatter(value);
            Object.assign(this.Attributes, result.attributes);
            this.Content = result.body;
        }
        catch (exception)
        {
            throw new YAMLException(exception);
        }
    }

    /**
     * Gets or sets the quality of the document.
     */
    public get Quality(): number
    {
        return this.quality;
    }
    public set Quality(value: number)
    {
        this.quality = value;
    }

    /**
     * Gets or sets the type of emojis to use.
     */
    public get EmojiType(): EmojiType
    {
        return this.emojiType;
    }
    public set EmojiType(value: EmojiType)
    {
        this.emojiType = value;
    }

    /**
     * Gets or sets the attributes of the document.
     */
    public get Attributes(): { [id: string]: any }
    {
        return this.attributes;
    }
    public set Attributes(value: { [id: string]: any })
    {
        this.attributes = value;
    }

    /**
     * Gets or sets the format to print the date.
     */

    public get DateFormat(): string
    {
        return this.dateFormat;
    }
    public set DateFormat(value: string)
    {
        this.dateFormat = value;
    }

    /**
     * Gets or sets the locale to print values.
     */
    public get Locale(): CultureInfo
    {
        return this.locale;
    }
    public set Locale(value: CultureInfo)
    {
        this.locale = value;
    }

    /**
     * Gets or sets the layout of the document.
     */
    public get Paper(): Paper
    {
        return this.paper;
    }
    public set Paper(value: Paper)
    {
        this.paper = value;
    }

    /**
     * Gets or sets a value indicating whether headers and footers are enabled.
     */
    public get HeaderFooterEnabled(): boolean
    {
        return this.headerFooterEnabled;
    }
    public set HeaderFooterEnabled(value: boolean)
    {
        this.headerFooterEnabled = value;
    }

    /**
     * Gets or sets the header of the document.
     */
    public get Header(): DocumentFragment
    {
        return this.header;
    }

    /**
     * Gets or sets the footer of the document.
     */
    public get Footer(): DocumentFragment
    {
        return this.footer;
    }

    /**
     * Gets or sets the definitions of the table of contents.
     */
    public get TocSettings(): TocSettings
    {
        return this.tocSettings;
    }
    public set TocSettings(value: TocSettings)
    {
        this.tocSettings = value;
    }

    /**
     * Gets or sets the template to use for the RenderBody-process.
     */
    public get Template(): string
    {
        return this.template;
    }
    public set Template(value: string)
    {
        this.template = value;
    }

    /**
     * Gets or sets a value indicating whether fancy code-blocks are enabled.
     */
    public get HighlightEnabled(): boolean
    {
        return this.highlightEnabled;
    }
    public set HighlightEnabled(value: boolean)
    {
        this.highlightEnabled = value;
    }

    /**
     * Gets or sets the stylesheets of the document.
     */
    public get StyleSheets(): string[]
    {
        return this.styleSheets;
    }
    public set StyleSheets(value: string[])
    {
        this.styleSheets = value;
    }

    /**
     * Renders content of the document.
     * 
     * @param content
     * The content which is to be rendered.
     */
    protected async RenderText(content: string): Promise<string>
    {
        // Preparing markdown-it
        let md = new MarkdownIt({
            html: true,
            highlight: (subject, language) =>
            {
                if (this.HighlightEnabled)
                {
                    subject = HighlightJs.highlight(language, subject, true).value;
                }
                else
                {
                    subject = md.utils.escapeHtml(subject);
                }

                return '<pre class="hljs"><code><div>' + subject + "</div></code></pre>";
            }
        });

        md.validateLink = () =>
        {
            return true;
        };

        {
            let slugifier = new Slugifier();

            Anchor(md, {
                slugify: heading => slugifier.CreateSlug(heading)
            });
        }

        md.use(Checkbox);

        if (this.TocSettings)
        {
            let slugifier = new Slugifier();

            md.use(MarkdownItToc, {
                includeLevel: this.TocSettings.Levels.toArray(),
                containerClass: this.TocSettings.Class,
                markerPattern: this.TocSettings.Indicator,
                listType: this.TocSettings.ListType === ListType.Ordered ? "ol" : "ul",
                slugify: heading => slugifier.CreateSlug(heading)
            });
        }

        if (this.emojiType)
        {
            // Making the emoji-variable visible for the callback
            let emoji = this.emojiType;
            md.use(MarkdownItEmoji);
            md.renderer.rules.emoji = (token, id) =>
            {
                switch (emoji)
                {
                    case EmojiType.None:
                        return token[id].markup;
                    case EmojiType.Native:
                        return token[id].content;
                    case EmojiType.Twitter:
                        return TwEmoji.parse(token[id].content);
                    case EmojiType.GitHub:
                        return '<img class="emoji" title=":' +
                            token[id].markup +
                            ':" alt=":' +
                            token[id].markup +
                            ':" src="https://assets-cdn.github.com/images/icons/emoji/unicode/' +
                            StringUtils.UTF8CharToCodePoints(token[id].content).toString(16).toLowerCase() +
                            '.png" allign="absmiddle" />';
                }
            };
        }

        md = this.markdownParser || md;

        // Preparing the attributes
        let view = {};

        for (let key in this.Attributes)
        {
            let value = this.Attributes[key];

            if (value instanceof Date || Date.parse(value))
            {
                value = new DateTimeFormatter(this.Locale).Format(this.DateFormat, new Date(value));
            }

            view[key] = value;
        }

        let html = md.render(content);
        return Mustache.render(html, view);
    }

    /**
     * Renders the body of the document.
     */
    public async Render(): Promise<string>
    {
        let styleCode = "";
        let scriptCode = "";

        for (let styleSheet of this.StyleSheets)
        {
            if (/.*:\/\//g.test(styleSheet) || !Path.isAbsolute(styleSheet))
            {
                styleCode += Dedent(`<link rel="stylesheet" type="text/css" href="/${styleSheet}" />\n`);
            }
            else
            {
                if (await FileSystem.pathExists(styleSheet))
                {
                    styleCode += "<style>" + (await FileSystem.readFile(styleSheet)).toString() + "</style>\n";
                }
                else
                {
                    throw new FileException(null, styleSheet);
                }
            }
        }

        for (let script of this.Scripts) {
            if (/.*:\/\//g.test(script) || !Path.isAbsolute(script)) {
                scriptCode += Dedent(`<script async="" src="${script}"charset="UTF-8"></script>\n`);
            }
            else {
                if (await FileSystem.pathExists(script)) {
                    scriptCode += "<script>" + (await FileSystem.readFile(script)).toString() + "</script>\n";
                }
                else {
                    throw new FileException(null, script);
                }
            }
        }

        let content = this.Content;

        let view = {
            styles: styleCode,
            scripts: scriptCode,
            content: await this.RenderText(content)
        };

        return Mustache.render(this.Template, view);
    }
}