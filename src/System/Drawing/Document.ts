import * as Checkbox from "markdown-it-checkbox";
import * as FS from "fs";
import * as Path from "path";
import * as URL from "url";
import * as Anchor from "markdown-it-anchor";
import DateTimeFormatter from "../Globalization/DateTimeFormatter";
import * as Dedent from "dedent";
import Encoding from "../Text/Encoding";
import * as FrontMatter from "front-matter";
import Fullname from "../Fullname";
import * as HighlightJs from "highlight.js";
import Paper from "./Paper";
import ListType from "./ListType";
import * as MarkdownIt from "markdown-it";
import * as MarkdownItEmoji from "markdown-it-emoji";
import * as MarkdownItToc from "markdown-it-table-of-contents";
import { MultiRange } from "multi-integer-range";
import * as Mustache from "mustache";
import * as Request from "request-promise-native";
import TocSettings from "./TocSettings";
import * as TwEmoji from "twemoji";
import UnauthorizedAccessException from "../UnauthorizedAccessException";
import YAMLException from "../YAML/YAMLException";
import CultureInfo from "culture-info";
import EmojiType from "./EmojiType";
import Renderable from "./Renderable";
import Slugifier from "./Slugifier";
import { TextDocument } from "vscode";
import DocumentFragment from "./DocumentFragment";
import ResourceManager from "../../Properties/ResourceManager";

/**
 * Represents a document.
 */
export default class Document extends Renderable
{
    /**
     * The quality of the document.
     */
    private quality: number = 90;

    /**
     * The name of the document.
     */
    private name: string = null;

    /**
     * The type of emojis to use.
     */
    private emojiType: EmojiType = EmojiType.GitHub;

    /**
     * The attributes of the document.
     */
    private attributes: any = {
        Author: Fullname.FullName,
        CreationDate: new Date(),
        PageNumber: "{{ PageNumber }}", // {{ PageNumber }} will be replaced in the Phantom-Script (see "Phantom/PDFGenerator.ts": ReplacePageNumbers)
        PageCount: "{{ PageCount }}"    // {{ PageCount }}  will be replaced in the Phantom-Script (see "PDFGenerator.ts": ReplacePageNumbers)
    };

    /**
     * The format to print the date.
     */
    private dateFormat: string = "default";

    /**
     * The language to print values.
     */
    private locale: CultureInfo;

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
    private tocSettings: TocSettings = new TocSettings();

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
                </article>
            </body>
        </html>`);

    /**
     * The highlight-style of the document.
     */
    private highlightStyle: string = "Default";

    /**
     * A value indicating whether system-provided stylesheets are enabled. 
     */
    private systemStylesEnabled: boolean = true;

    /**
     * The stylesheets of the document.
     */
    private styleSheets: string[] = [];

    /**
     * Initializes a new instance of the Document class with a file-path and a configuration.
     * 
     * @param document
     * The `TextDocument` to load the info from.
     * 
     * @param config
     * The configuration to set.
     */
    constructor(document: TextDocument = null)
    {
        super();

        if (document)
        {
            try
            {
                this.Content = FS.readFileSync(document.fileName, "utf-8");
                this.Attributes.CreationDate = FS.statSync(document.fileName).ctime;
            }
            catch (e)
            {
                if (e instanceof Error)
                {
                    if (e.name === "YAMLException")
                    {
                        throw new YAMLException(e);
                    }
                    else if ("path" in e)
                    {
                        throw new UnauthorizedAccessException((e as any).path as string);
                    }
                }
            }
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
     * Gets or sets the name of the document.
     */
    public get Name(): string
    {
        return this.name;
    }
    public set Name(value: string)
    {
        this.name = value;
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
    public set Header(value: DocumentFragment)
    {
        this.header = value;
    }

    /**
     * Gets or sets the footer of the document.
     */
    public get Footer(): DocumentFragment
    {
        return this.footer;
    }
    public set Footer(value: DocumentFragment)
    {
        this.footer = value;
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
     * Gets or sets the highlight-style of the document.
     */
    public get HighlightStyle(): string
    {
        return this.highlightStyle;
    }
    public set HighlightStyle(value: string)
    {
        this.highlightStyle = value;
    }

    /**
     * Gets or sets a value indicating whether system-provided stylesheets are enabled.
     */
    public get SystemStylesEnabled(): boolean
    {
        return this.systemStylesEnabled;
    }
    public set SystemStylesEnabled(value: boolean)
    {
        this.systemStylesEnabled = value;
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
     * Returns a JSON-string which represents the document.
     */
    public async toJSON()
    {
        return {
            Quality: this.Quality,
            Locale: this.Locale,
            Layout: this.Paper.toJSON(),
            HeaderFooterEnabled: this.HeaderFooterEnabled,
            Header: await this.Header.Render(),
            Content: await this.Render(),
            Footer: await this.Footer.Render()
        };
    }

    /**
     * Renders content of the document.
     * 
     * @param content
     * The content which is to be rendered.
     */
    protected async RenderText(content: string): Promise<string>
    {
        let highlightStyle = this.HighlightStyle;

        // Preparing markdown-it
        let md = new MarkdownIt({
            html: true,
            highlight(subject, language)
            {
                if ((highlightStyle !== "None") && language && HighlightJs.getLanguage(language))
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
                slugify: (heading) =>
                {
                    return slugifier.CreateSlug(heading);
                }
            });
        }

        md.use(Checkbox);

        if (this.TocSettings.Enabled)
        {
            let slugifier = new Slugifier();

            md.use(MarkdownItToc, {
                includeLevel: new MultiRange(this.TocSettings.Levels).toArray(),
                containerClass: this.TocSettings.Class,
                markerPattern: this.TocSettings.Indicator,
                listType: this.TocSettings.ListType === ListType.Ordered ? "ol" : "ul",
                slugify: (heading) =>
                {
                    return slugifier.CreateSlug(heading);
                }
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
                            Encoding.UTF8CharToCodePoints(token[id].content).toString(16).toLowerCase() +
                            '.png" allign="absmiddle" />';
                }
            };
        }

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
        try
        {
            let template = this.Template;

            // Preparing the styles
            let styleSheets = this.StyleSheets;
            styleSheets.push(ResourceManager.Files.Get("SystemStyle"));

            if (this.SystemStylesEnabled)
            {
                let systemStyles: string[] = [];
                systemStyles.push(ResourceManager.Files.Get("DefaultStyle"));

                if (this.HighlightStyle === "Default")
                {
                    systemStyles.push(ResourceManager.Files.Get("DefaultHighlight"));
                }

                if (this.EmojiType === EmojiType.GitHub)
                {
                    systemStyles.push(ResourceManager.Files.Get("EmojiStyle"));
                }

                styleSheets = systemStyles.concat(styleSheets);
            }

            let styleCode = "<style>\n";

            styleSheets.forEach(styleSheet =>
            {
                if (FS.existsSync(styleSheet))
                {
                    styleCode += FS.readFileSync(styleSheet).toString() + "\n";
                }
            });

            for (let styleSheet of styleSheets)
            {
                if (/(http|https)/g.test(URL.parse(styleSheet).protocol))
                {
                    {
                        let result = await Request(styleSheet);

                        if (result.statusCode === 200)
                        {
                            styleCode += result.body;
                        }
                    }
                }
                else
                {
                    // Removing leading 'file://' from the local path.
                    styleSheet.replace(/^file:\/\//, "");

                    {
                        if (FS.existsSync(styleSheet))
                        {
                            styleCode += FS.readFileSync(styleSheet).toString() + "\n";
                        }
                    }
                }
            }
            
            styleCode += "</style>";

            let content = this.Content;

            let view = {
                styles: styleCode,
                content: await this.RenderText(content)
            };

            return Mustache.render(template, view);
        }
        catch (e)
        {
            if ("path" in e)
            {
                throw new UnauthorizedAccessException(e.path);
            }

            throw e;
        }
    }
}