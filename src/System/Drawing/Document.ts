import * as Checkbox from 'markdown-it-checkbox';
import * as FS from 'fs';
import * as Path from 'path';
import * as URL from 'url';
import * as VSCode from 'vscode';
import * as Anchor from 'markdown-it-anchor';
import { DateTimeFormatter } from '../Globalization/DateTimeFormatter';
import { EmbeddingOption } from './EmbeddingOption';
import { Encoding } from "../Text/Encoding";
import * as FrontMatter from 'front-matter';
import { Fullname } from '../Fullname';
import { Header, Footer, Section } from './Section';
import * as HighlightJs from 'highlightjs';
import { Layout } from "./Layout";
import { ListType } from "./ListType";
import { Margin } from "./Margin";
import * as MarkdownIt from 'markdown-it';
import * as MarkdownItEmoji from 'markdown-it-emoji';
import * as MarkdownItToc from 'markdown-it-table-of-contents';
import { MultiRange } from 'multi-integer-range';
import * as Mustache from 'mustache';
import * as Request from 'sync-request';
import { Settings } from "../../Properties/Settings";
import { TOCSettings } from "./TOCSettings";
import * as TwEmoji from 'twemoji';
import { UnauthorizedAccessException } from "../UnauthorizedAccessException";
import { YAMLException } from "../YAML/YAMLException";

/**
 * Represents a document.
 */
export class Document
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
     * A value indicating whether emojis should be used.
     */
    private emoji: string | boolean = "github";

    /**
     * The attributes of the document.
     */
    private attributes: any = {
        Author: Fullname.FullName,
        CreationDate: new Date(),
        PageNumber: '{{ PageNumber }}', // {{ PageNumber }} will be replaced in the Phantom-Script (see "Phantom/PDFGenerator.ts": ReplacePageNumbers)
        PageCount: '{{ PageCount }}'    // {{ PageCount }}  will be replaced in the Phantom-Script (see "PDFGenerator.ts": ReplacePageNumbers)
    };

    /**
     * The format to print the date.
     */
    private dateFormat: string = 'default';

    /**
     * The language to print values.
     */
    private locale: string = VSCode.env.language;

    /**
     * The layout of the document.
     */
    private layout: Layout = new Layout();

    /**
     * The header of the document.
     */
    private header: Header = new Header('15mm', '<table style="width: 100%; table-layout: fixed; "><td style="text-align: left; ">{{ Author }}</td><td style="text-align: center">{{ PageNumber }}/{{ PageCount }}</td><td style="text-align: right">{{ Company.Name }}</td></table>');

    /**
     * A set of special headers.
     */
    private specialHeaders: { [id: number]: Header } = {};

    /**
     * The header for even pages.
     */
    private evenHeader: Header = null;

    /**
     * The header for odd pages.
     */
    private oddHeader: Header = null;

    /**
     * The header for the last page.
     */
    private lastHeader: Header = null;

    /**
     * The footer of the document.
     */
    private footer: Footer = new Footer('1cm', '<table style="width: 100%; table-layout: fixed; "><td style="text-align: left; "></td><td style="text-align: center">{{ CreationDate }}</td><td style="text-align: right"></td></table>');

    /**
     * A set of special footers.
     */
    private specialFooters: { [id: number]: Footer } = {};

    /**
     * The footer for even pages.
     */
    private evenFooter: Footer = null;

    /**
     * The footer for odd pages.
     */
    private oddFooter: Footer = null;

    /**
     * The footer for the last page.
     */
    private lastFooter: Footer = null;

    /**
     * The definitions of the table of contents.
     */
    private tocSettings: TOCSettings = new TOCSettings();

    /**
     * The template to use for the RenderBody-process.
     */
    private template: string = Path.join(__dirname, '..', '..', 'Resources', 'SystemTemplate.html');

    /**
     * The wrapper of the content of the document.
     */
    private wrapper: string = null;

    /**
     * The highlight-style of the document.
     */
    private highlightStyle: boolean | string = true;

    /**
     * The embedding-options of the document.
     */
    private embeddingStyle: EmbeddingOption | boolean = EmbeddingOption.Local;

    /**
     * A value indicating whether system-provided stylesheets are enabled. 
     */
    private systemStylesEnabled: boolean = true;

    /**
     * The styles of the document.
     */
    private styles: string = '';

    /**
     * The stylesheets of the document.
     */
    private styleSheets: string[] = [];

    /**
     * The content of the document.
     */
    private content: string = '';

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
                this.Content = FS.readFileSync(filePath, 'utf-8');
            }
            catch (e)
            {
                if (e instanceof Error)
                {
                    if (e.name == 'YAMLException')
                    {
                        throw new YAMLException(e);
                    }
                    else if ('path' in e)
                    {
                        throw new UnauthorizedAccessException(e['path']);
                    }
                }
            }
        }
    }

    /**
     * Gets or sets the quality of the document.
     */
    @enumerable(true)
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
    @enumerable(true)
    public get Name(): string
    {
        return this.name;
    }
    public set Name(value: string)
    {
        this.name = value;
    }

    /**
     * Gets or sets a value indicating whether emojis should be used.
     */
    @enumerable(true)
    public get Emoji(): string | boolean
    {
        return this.emoji;
    }
    public set Emoji(value: string | boolean)
    {
        this.emoji = value;
    }

    /**
     * Gets or sets the attributes of the document.
     */
    @enumerable(true)
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
    @enumerable(true)
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
    @enumerable(true)
    public get Locale(): string
    {
        return this.locale;
    }
    public set Locale(value: string)
    {
        this.locale = value;
    }

    /**
     * Gets or sets the layout of the document.
     */
    @enumerable(true)
    public get Layout(): Layout
    {
        return this.layout;
    }
    public set Layout(value: Layout)
    {
        this.layout = value;
    }

    /**
     * Gets or sets the header of the document.
     */
    @enumerable(true)
    public get Header(): Header
    {
        return this.header;
    }
    public set Header(value: Header)
    {
        this.header = value;
    }

    /**
     * Gets or sets a set of special headers.
     */
    @enumerable(true)
    public get SpecialHeaders(): { [id: number]: Header }
    {
        return this.specialHeaders;
    }
    public set SpecialHeaders(value: { [id: number]: Header })
    {
        this.specialHeaders = value;
    }

    /**
     * Gets or sets the header for even pages.
     */
    @enumerable(true)
    public get EvenHeader(): Header
    {
        if (this.evenHeader)
        {
            return this.evenHeader;
        }
        else
        {
            return this.header;
        }
    }
    public set EvenHeader(value: Header)
    {
        this.evenHeader = value;
    }

    /**
     * Gets or sets the header for even pages.
     */
    @enumerable(true)
    public get OddHeader(): Header
    {
        if (this.oddHeader)
        {
            return this.oddHeader;
        }
        else
        {
            return this.header;
        }
    }
    public set OddHeader(value: Header)
    {
        this.oddHeader = value;
    }

    /**
     * Gets or sets the header for the last page.
     */
    @enumerable(true)
    public get LastHeader(): Header
    {
        if (this.lastHeader)
        {
            return this.lastHeader;
        }
        else
        {
            return this.header;
        }
    }
    public set LastHeader(value: Header)
    {
        this.lastHeader = value;
    }

    /**
     * Gets or sets the footer of the document.
     */
    @enumerable(true)
    public get Footer(): Footer
    {
        return this.footer;
    }
    public set Footer(value: Footer)
    {
        this.footer = value;
    }

    /**
     * Gets or sets a set of special footers.
     */
    @enumerable(true)
    public get SpecialFooters(): { [id: number]: Footer }
    {
        return this.specialFooters;
    }
    public set SpecialFooters(value: { [id: number]: Footer })
    {
        this.specialFooters = value;
    }

    /**
     * Gets or sets the footer for even pages.
     */
    @enumerable(true)
    public get EvenFooter(): Footer
    {
        if (this.evenFooter)
        {
            return this.evenFooter;
        }
        else
        {
            return this.footer;
        }
    }
    public set EvenFooter(value: Footer)
    {
        this.evenFooter = value;
    }

    /**
     * Gets or sets the footer for odd pages.
     */
    @enumerable(true)
    public get OddFooter(): Footer
    {
        if (this.evenFooter)
        {
            return this.evenFooter;
        }
        else
        {
            return this.footer;
        }
    }
    public set OddFooter(value: Footer)
    {
        this.oddFooter = value;
    }

    /**
     * Gets or sets the footer for the last page.
     */
    @enumerable(true)
    public get LastFooter(): Footer
    {
        if (this.lastFooter)
        {
            return this.lastFooter;
        }
        else
        {
            return this.footer;
        }
    }
    public set LastFooter(value: Footer)
    {
        this.lastFooter = value;
    }

    /**
     * Gets or sets the definitions of the table of contents.
     */
    @enumerable(true)
    public get TOCSettings(): TOCSettings
    {
        return this.tocSettings;
    }
    public set TOCSettings(value: TOCSettings)
    {
        this.tocSettings = value;
    }

    /**
     * Gets or sets the template to use for the RenderBody-process.
     */
    @enumerable(true)
    public get Template(): string
    {
        return this.template;
    }
    public set Template(value: string)
    {
        this.template = value;
    }

    /**
     * Gets or sets the wrapper of the content of the document.
     */
    @enumerable(true)
    public get Wrapper(): string
    {
        return this.wrapper;
    }
    public set Wrapper(value: string)
    {
        this.wrapper = value;
    }

    /**
     * Gets or sets the highlight-style of the document.
     */
    @enumerable(true)
    public get HighlightStyle(): boolean | string
    {
        return this.highlightStyle;
    }
    public set HighlightStyle(value: boolean | string)
    {
        this.highlightStyle = value;
    }

    /**
     * Gets or sets the embedding-options of the document.
     */
    @enumerable(true)
    public get EmbeddingStyle(): EmbeddingOption | boolean
    {
        return this.embeddingStyle;
    }
    public set EmbeddingStyle(value: EmbeddingOption | boolean)
    {
        this.embeddingStyle = value;
    }

    /**
     * Gets or sets a value indicating whether system-provided stylesheets are enabled.
     */
    @enumerable(true)
    public get SystemStylesEnabled(): boolean
    {
        return this.systemStylesEnabled;
    }
    public set SystemStylesEnabled(value: boolean)
    {
        this.systemStylesEnabled = value;
    }

    /**
     * Gets or sets the styles of the document.
     */
    @enumerable(true)
    public get Styles(): string
    {
        return this.styles;
    }
    public set Styles(value: string)
    {
        this.styles = value;
    }

    /**
     * Gets or sets the stylesheets of the document.
     */
    @enumerable(true)
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
    @enumerable(true)
    public get Content(): string
    {
        return this.content;
    }
    public set Content(value: string)
    {
        let content = FrontMatter(value);
        for (var key in content.attributes)
        {
            this.Attributes[key] = content.attributes[key];
        }
        this.content = content.body;
    }

    /**
     * Returns a JSON-string which represents the document.
     */
    public toJSON(): string
    {
        let document: any = {
            Quality: this.Quality,
            Locale: this.Locale,
            Layout: this.Layout.toJSON(),
            Header: this.RenderSection(this.Header),
            SpecialHeaders: {},
            EvenHeader: this.RenderSection(this.evenHeader),
            OddHeader: this.RenderSection(this.oddHeader),
            LastHeader: this.RenderSection(this.lastHeader),
            Content: this.RenderBody(),
            Footer: this.RenderSection(this.Footer),
            SpecialFooters: {},
            EvenFooter: this.RenderSection(this.evenFooter),
            OddFooter: this.RenderSection(this.oddFooter),
            LastFooter: this.RenderSection(this.lastFooter)
        }

        for (var key in this.SpecialHeaders)
        {
            document.SpecialHeaders[key] = this.RenderSection(this.SpecialHeaders[key]);
        }

        for (var key in this.SpecialFooters)
        {
            document.SpecialFooters[key] = this.RenderSection(this.SpecialFooters[key]);
        }

        return JSON.stringify(document);
    }

    /**
     * Gets the HTML-code which represents the content of the document.
     */
    public get HTML(): string
    {
        return this.RenderBody();
    }

    /**
     * Renders a section of the document.
     * 
     * @param section
     * The section which is to be rendered.
     */
    private RenderSection(section: Section): object
    {
        if (section)
        {
            let result: any = section.toJSON();
            result.Content = this.Render(result.Content);
            return result;
        }
        else
        {
            return null;
        }
    }

    /**
     * Renders content of the document.
     * 
     * @param content
     * The content which is to be rendered.
     */
    private Render(content: string): string
    {
        // Making the hightlight-variable visible for the callback (by declaring a new 'var'-variable)
        // See: http://stackoverflow.com/questions/762011/whats-the-difference-between-using-let-and-var-to-declare-a-variable
        var highlightStyle = this.HighlightStyle;

        // Preparing markdown-it
        let md = new MarkdownIt({
            html: true,
            highlight: function (subject, language)
            {
                if (highlightStyle && language && HighlightJs.getLanguage(language))
                {
                    subject = HighlightJs.highlight(language, subject, true).value;
                }
                else
                {
                    subject = md.utils.escapeHtml(subject);
                }

                return '<pre class="hljs"><code><div>' + subject + '</div></code></pre>';
            }
        });
        md.validateLink = function()
        {
            return true;
        }
        md.use(Anchor);
        md.use(Checkbox);
        md.use(MarkdownItToc, {
            includeLevel: new MultiRange(this.TOCSettings.Levels).toArray(),
            containerClass: this.TOCSettings.Class,
            markerPattern: this.TOCSettings.Indicator,
            listType: ListType[this.TOCSettings.ListType]
        });

        if (this.emoji)
        {
            // Making the emoji-variable visible for the callback
            var emoji = this.emoji;
            md.use(MarkdownItEmoji);
            md.renderer.rules.emoji = function (token, id)
            {
                switch (emoji)
                {
                    case false:
                        return token[id].markup;
                    case 'twitter':
                        return TwEmoji.parse(token[id].content);
                    case 'native':
                        return token[id].content;
                    case 'github':
                    case true:
                    default:
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
        for (var key in this.Attributes)
        {
            let value = this.Attributes[key];
            if (value instanceof Date)
            {
                value = new DateTimeFormatter(this.Locale).Format(this.DateFormat, value);
            }
            else if (/function[\s]*\(\)[\s]*{([\s\S]*)}/gm.test(value))
            {
                value = value.replace(/function[\s]*\(\)[\s]*{([\s\S]*)}/gm, '$1');
                value = new Function(value);

                try
                {
                    let dateTest = function (value)
                    {
                        return eval('value()');
                    }

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
        this.Quality = Settings.Default.Quality;
        this.Emoji = Settings.Default.Emoji;

        for (let key in Settings.Default.Attributes)
        {
            this.Attributes[key] = Settings.Default.Attributes[key];
        }

        this.Locale = Settings.Default.Locale;
        this.DateFormat = Settings.Default.DateFormat;

        this.Layout = Settings.Default.Layout;

        this.Header = Settings.Default.Header;
        this.SpecialHeaders = Settings.Default.SpecialHeaders;
        this.EvenHeader = Settings.Default.EvenHeader;
        this.OddHeader = Settings.Default.OddHeader;
        this.LastHeader = Settings.Default.LastHeader;
        this.Footer = Settings.Default.Footer;
        this.SpecialFooters = Settings.Default.SpecialFooters;
        this.EvenFooter = Settings.Default.EvenFooter;
        this.OddFooter = Settings.Default.OddFooter;
        this.LastFooter = Settings.Default.LastFooter;

        this.TOCSettings = Settings.Default.TOCSettings;

        if (Settings.Default.Template)
        {
            this.Template = Settings.Default.Template;
        }
        else if (Settings.Default.SystemStyles)
        {
            this.Template = Path.join(__dirname, '..', '..', '..', '..', 'Resources', 'Template.html');
        }

        this.Wrapper = Settings.Default.Wrapper;

        this.HighlightStyle = Settings.Default.HighlightStyle;

        if (typeof (this.HighlightStyle) != 'boolean')
        {
            this.StyleSheets.push(Path.join(__dirname, '..', '..', '..', '..', 'node_modules', 'highlightjs', this.HighlightStyle + '.css'));
        }

        if (typeof (Settings.Default.EmbeddingStyle) == "boolean")
        {
            this.EmbeddingStyle = Settings.Default.EmbeddingStyle;
        }
        else
        {
            this.EmbeddingStyle = EmbeddingOption[Settings.Default.EmbeddingStyle as string];
        }

        this.SystemStylesEnabled = Settings.Default.SystemStyles;

        if (Settings.Default.Styles)
        {
            this.Styles += Settings.Default.Styles;
        }

        for (let key in Settings.Default.StyleSheets)
        {
            this.StyleSheets.push(Settings.Default.StyleSheets[key]);
        }
    }

    /**
     * Creates a new header based on the values of the header-object.
     * 
     * @param source
     * The source to load the value to set from.
     * 
     * @param propertyKey
     * The key of the property to write the header to.
     * 
     * @param target
     * The target-object to write the property to.
     */
    private CreateHeader(source, propertyKey: string, target?): Header;

    /**
     * Creates a new header based on the values of the header-configuration.
     * 
     * @param config
     * The Workspace-Configuration of Visual Studio Code.
     * 
     * @param configKey
     * The configuration-key to load the values to set from.
     * 
     * @param propertyKey
     * The key of the property to write the header to.
     * 
     * @param target
     * The target-object to write the property to.
     */
    private CreateHeader(config: VSCode.WorkspaceConfiguration, configKey: string, propertyKey: string, target?): Header;

    private CreateHeader(source: VSCode.WorkspaceConfiguration | any, configKey: string, propertyKey: string | any = this, target = this): Header
    {
        let prototype = new Header();

        if (typeof propertyKey == 'object')
        {
            // First implementation has been called (object, string, object?)
            return this.CreateSection(prototype, source, configKey, propertyKey);
        }
        else
        {
            // Second implementation has been called (VSCode.WorkspaceConfiguration, string, string, object?)
            return this.CreateSection(prototype, source as VSCode.WorkspaceConfiguration, configKey, propertyKey, target);
        }
    }

    /**
     * Creates a new footer based on the values of the footer-object.
     * 
     * @param source
     * The source to load the value to set from.
     * 
     * @param propertyKey
     * The key of the property to write the footer to.
     * 
     * @param target
     * The target-object to write the property to.
     */
    private CreateFooter(source, propertyKey: string, target?): Footer;

    /**
     * Creates a new footer based on the values of the footer-configuration.
     * 
     * @param config
     * The Workspace-Configuration of Visual Studio Code.
     * 
     * @param configKey
     * The configuration-key to load the values to set from.
     * 
     * @param propertyKey
     * The key of the property to write the footer to.
     * 
     * @param target
     * The target-object to write the property to.
     */
    private CreateFooter(config: VSCode.WorkspaceConfiguration, configKey: string, propertyKey: string, target?): Footer;

    private CreateFooter(source: VSCode.WorkspaceConfiguration | any, configKey: string, propertyKey: string | any = this, target = this): Footer
    {
        let prototype = new Footer();

        if (typeof propertyKey == 'string')
        {
            // First implementation has been called (object, string, object?)
            return this.CreateSection(prototype, source, configKey, propertyKey);
        }
        else
        {
            // Second implementation has been called (VSCode.WorkspaceConfiguration, string, string, object?)
            return this.CreateSection(prototype, source as VSCode.WorkspaceConfiguration, configKey, propertyKey, target);
        }
    }

    /**
     * Creates a new section based on the values of the section-object.
     * 
     * @param prototype
     * The prototype of the section to create.
     * 
     * @param source
     * The source to load the value to set from.
     * 
     * @param propertyKey
     * The key of the property to write the header to.
     * 
     * @param target
     * The target-object to write the property to.
     */
    private CreateSection(prototype: Section, source, propertyKey: string, target?): Section;

    /**
     * Creates a new section based on the values of the section-object.
     * 
     * @param prototype
     * The prototype of the section to create.
     * 
     * @param config
     * The Workspace-Configuration of Visual Studio Code.
     * 
     * @param configKey
     * The configuration-key to load the values to set from.
     * 
     * @param propertyKey
     * The key of the property to write the header to.
     * 
     * @param target
     * The target-object to write the property to.
     */
    private CreateSection(prototype: Section, config: VSCode.WorkspaceConfiguration, configKey: string, propertyKey: string, target?): Section;

    private CreateSection(prototype: Section, source: VSCode.WorkspaceConfiguration | any, configKey: string, propertyKey: string | any = this, target = this): Section
    {
        let result = prototype;
        let section;

        if (typeof propertyKey == 'object')
        {
            // First implementation has been called (Section, object, string, object?)
            target = propertyKey;
            propertyKey = configKey;
            section = source;
        }
        else
        {
            // Second implementation has been called (Section, VSCode.WorkspaceConfiguration, string, string, object?)
            let config = source as VSCode.WorkspaceConfiguration;

            if (config.has(configKey))
            {
                section = config.get(configKey);
            }
            else
            {
                return null;
            }
        }

        if (this.ValidateSection(section))
        {
            prototype.Height = section['height'];
            prototype.Content = section['content'];

            Reflect.set(target, propertyKey, prototype);
            return Reflect.get(target, propertyKey);
        }
        else
        {
            return null;
        }
    }

    /**
     * Validates whether the section contains all required values.
     * 
     * @param section
     * The section to validate.
     */
    private ValidateSection(section): boolean
    {
        return ('height' in section) && ('content' in section);
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
            let systemStyleSheets: string[] = [];
            let styleSheets = this.StyleSheets;
            let markdownExt = VSCode.extensions.getExtension('Microsoft.vscode-markdown');

            if (this.SystemStylesEnabled)
            {
                let styles: string[] = [];
                if (markdownExt)
                {
                    styles.push(Path.join(markdownExt.extensionPath, 'media', 'markdown.css'));
                    styles.push(Path.join(markdownExt.extensionPath, 'media', 'tomorrow.css'));
                }
                styles.push(Path.join(__dirname, '..', '..', 'Resources', 'css', 'styles.css'));

                systemStyleSheets = styles.concat(systemStyleSheets);
            }

            let styles = '<style>\n';

            if (this.Styles)
            {
                styles += this.Styles + '\n';
            }

            systemStyleSheets.forEach(styleSheet =>
            {
                if (FS.existsSync(styleSheet))
                {
                    styles += FS.readFileSync(styleSheet).toString() + '\n';
                }
            });

            styleSheets.forEach(styleSheet =>
            {
                if (/(http|https)/g.test(URL.parse(styleSheet).protocol))
                {
                    if (this.EmbeddingStyle === true || this.EmbeddingStyle == EmbeddingOption.All || this.EmbeddingStyle == EmbeddingOption.Web)
                    {
                        let result = Request(styleSheet);

                        if (result.statusCode == 200)
                        {
                            styles += result.body;
                        }
                    }
                    else
                    {
                        styles += '</style>\n<link rel="stylesheet" href="' + styleSheet + '" type="text/css">\n<style>';
                    }
                }
                else
                {
                    // Removing leading 'file://' from the local path.
                    styleSheet.replace(/^file:\/\//, '');

                    if (this.EmbeddingStyle === true || this.EmbeddingStyle == EmbeddingOption.All || this.EmbeddingStyle == EmbeddingOption.Local)
                    {
                        if (FS.existsSync(styleSheet))
                        {
                            styles += FS.readFileSync(styleSheet).toString() + '\n';
                        }
                    }
                    else
                    {
                        styles += '</style>\n<link rel="stylesheet" href="' + styleSheet + '" type="text/css">\n<style>';
                    }
                }
            });
            styles += '</style>';

            let content = this.Content;

            if (this.Wrapper)
            {
                content = Mustache.render(this.Wrapper, { content: content });
            }

            let view = {
                styles: styles,
                content: this.Render(content)
            }

            return Mustache.render(template, view);
        }
        catch (e)
        {
            if ('path' in e)
            {
                throw new UnauthorizedAccessException(e['path']);
            }

            throw e;
        }
    }
}

function enumerable(value)
{
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor)
    {
        descriptor.enumerable = value;
    };
}