import * as Checkbox from "markdown-it-checkbox";
import * as FS from "fs";
import * as Path from "path";
import * as URL from "url";
import * as Anchor from "markdown-it-anchor";
import DateTimeFormatter from "../Globalization/DateTimeFormatter";
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
import * as Request from "sync-request";
import Settings from "../../Properties/Settings";
import TocSettings from "./TocSettings";
import * as Transliteration from "transliteration";
import * as TwEmoji from "twemoji";
import UnauthorizedAccessException from "../UnauthorizedAccessException";
import YAMLException from "../YAML/YAMLException";
import CultureInfo from "culture-info";
import EmojiType from "./EmojiType";

/**
 * Represents a document.
 */
export default class Document
{
    /**
     * Contains all processed slugs and the count of them.
     */
    private slugs: { [key: string]: number } = {};

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
     * The header of the document.
     */
    private header: string = "<table style=\"width: 100%; table-layout: fixed; \"><td style=\"text-align: left; \">{{ Author }}</td><td style=\"text-align: center\">{{ PageNumber }}/{{ PageCount }}</td><td style=\"text-align: right\">{{ Company.Name }}</td></table>";

    /**
     * The footer of the document.
     */
    private footer: string = "<table style=\"width: 100%; table-layout: fixed; \"><td style=\"text-align: left; \"></td><td style=\"text-align: center\">{{ CreationDate }}</td><td style=\"text-align: right\"></td></table>";

    /**
     * The definitions of the table of contents.
     */
    private tocSettings: TocSettings = new TocSettings();

    /**
     * The template to use for the RenderBody-process.
     */
    private template: string = Path.join(__dirname, "..", "..", "..", "Resources", "Template.html");

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
     * The content of the document.
     */
    private content: string = "";

    /**
     * Initializes a new instance of the Document class with a file-path and a configuration.
     * 
     * @param filePath
     * The path to the file to load the content from.
     * 
     * @param config
     * The configuration to set.
     */
    constructor(filePath: string = null)
    {
        this.LoadSettings();

        if (filePath)
        {
            try
            {
                this.Content = FS.readFileSync(filePath, "utf-8");
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
     * Gets or sets the header of the document.
     */
    public get HeaderTemplate(): string
    {
        return this.header;
    }
    public set HeaderTemplate(value: string)
    {
        this.header = value;
    }

    /**
     * Gets or sets the footer of the document.
     */
    public get FooterTemplate(): string
    {
        return this.footer;
    }
    public set FooterTemplate(value: string)
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
     * Gets or sets the content of the document.
     */
    public get Content(): string
    {
        return this.content;
    }
    public set Content(value: string)
    {
        let content = FrontMatter(value);
        for (let key in content.attributes)
        {
            this.Attributes[key] = content.attributes[key];
        }
        this.content = content.body;
    }

    /**
     * Returns a JSON-string which represents the document.
     */
    public toJSON()
    {
        return {
            Quality: this.Quality,
            Locale: this.Locale,
            Layout: this.Paper.toJSON(),
            HeaderFooterEnabled: Settings.Default.HeaderFooterEnabled,
            Header: this.Render(this.HeaderTemplate),
            Content: this.RenderBody(),
            Footer: this.Render(this.FooterTemplate)
        };
    }

    /**
     * Gets the HTML-code which represents the content of the document.
     */
    public get HTML(): string
    {
        return this.RenderBody();
    }

    /**
     * Renders content of the document.
     * 
     * @param content
     * The content which is to be rendered.
     */
    private Render(content: string): string
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
        
        Anchor(md, {
            slugify: (heading) =>
            {
                let slug = Transliteration.slugify(heading, {lowercase: true, separator: "-", ignore: []});
                if (this.slugs[slug])
                {
                    slug += "-" + (this.slugs[slug] + 1);
                    this.slugs[slug]++;
                }
                else
                {
                    this.slugs[slug] = 0;
                }

                return slug;
            }
        });

        md.use(Checkbox);

        if (this.TocSettings.Enabled)
        {
            md.use(MarkdownItToc, {
                includeLevel: new MultiRange(this.TocSettings.Levels).toArray(),
                containerClass: this.TocSettings.Class,
                markerPattern: this.TocSettings.Indicator,
                listType: ListType[this.TocSettings.ListType]
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
            else if (/function[\s]*\(\)[\s]*{([\s\S]*)}/gm.test(value))
            {
                value = value.replace(/function[\s]*\(\)[\s]*{([\s\S]*)}/gm, "$1");
                value = new Function(value);

                try
                {
                    let dateTest = (attribute: () => any) =>
                    {
                        return attribute();
                    };

                    if (dateTest(value) instanceof Date)
                    {
                        value = new DateTimeFormatter(this.Locale).Format(this.DateFormat, dateTest(value));
                    }
                }
                catch (e)
                { }
            }

            view[key] = value;
        }

        let html = md.render(content);
        return Mustache.render(html, view);
    }

    /**
     * Loads the vs-config
     */
    private LoadSettings(): void
    {
        this.Quality = Settings.Default.ConversionQuality;
        this.EmojiType = Settings.Default.EmojiType;

        for (let key in Settings.Default.Attributes)
        {
            this.Attributes[key] = Settings.Default.Attributes[key];
        }

        this.Locale = new CultureInfo(Settings.Default.Locale);
        this.DateFormat = Settings.Default.DateFormat;

        this.Paper = Settings.Default.PaperFormat;

        this.HeaderTemplate = Settings.Default.HeaderTemplate;
        this.FooterTemplate = Settings.Default.FooterTemplate;

        this.TocSettings = Settings.Default.TocSettings;

        if (Settings.Default.Template)
        {
            this.Template = Settings.Default.Template;
        }
        else if (Settings.Default.SystemStylesEnabled)
        {
            this.Template = Path.join(__dirname, "..", "..", "..", "Resources", "SystemTemplate.html");
        }

        this.HighlightStyle = Settings.Default.HighlightStyle;

        if (this.HighlightStyle !== "Default" && this.HighlightStyle !== "None" && this.HighlightStyle)
        {
            this.StyleSheets.push(Path.join(__dirname, "..", "..", "..", "node_modules", "highlightjs", "styles", this.HighlightStyle + ".css"));
        }

        this.SystemStylesEnabled = Settings.Default.SystemStylesEnabled;

        for (let key in Settings.Default.StyleSheets)
        {
            this.StyleSheets.push(Settings.Default.StyleSheets[key]);
        }
    }

    /**
     * Renders the body of the document.
     */
    private RenderBody(): string
    {
        try
        {
            let template = FS.readFileSync(this.Template).toString();

            // Preparing the styles
            let styleSheets = this.StyleSheets;

            if (this.SystemStylesEnabled)
            {
                let systemStyles: string[] = [];
                let stylesRoot = Path.join(__dirname, "..", "..", "..", "Resources", "css");
                systemStyles.push(Path.join(stylesRoot, "styles.css"));
                systemStyles.push(Path.join(stylesRoot, "markdown.css"));

                if (this.HighlightStyle === "Default")
                {
                    systemStyles.push(Path.join(stylesRoot, "highlight.css"));
                }

                if (this.EmojiType === EmojiType.GitHub)
                {
                    systemStyles.push(Path.join(stylesRoot, "emoji.css"));
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

            styleSheets.forEach(styleSheet =>
            {
                if (/(http|https)/g.test(URL.parse(styleSheet).protocol))
                {
                    {
                        let result = Request(styleSheet);

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
            });
            styleCode += "</style>";

            let content = this.Content;

            let view = {
                styles: styleCode,
                content: this.Render(content)
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