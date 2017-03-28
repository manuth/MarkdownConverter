import * as FS from 'fs';
import * as Path from 'path';
import * as URL from 'url';
import * as VSCode from 'vscode';
import * as Anchor from 'markdown-it-anchor';
import { Base } from "./Core/Base";
import { configKey } from "./Core/Constants";
import { DateTimeFormatter } from './Core/DateTimeFormatter';
import * as Emoji from 'markdown-it-emoji';
import * as FrontMatter from 'front-matter';
import { Fullname } from './Core/Fullname';
import { Header, Footer, Section } from './Section';
import { Layout } from "./Layout";
import * as MarkdownIt from 'markdown-it';
import * as Mustache from 'mustache';
import * as TwEmoji from 'twemoji';
import { Utilities } from "./Core/Utilities";

/**
 * Represents a document.
 */
export class Document extends Base
{
    /**
     * The configuration of the document.
     */
    private config = VSCode.workspace.getConfiguration(configKey + '.document');

    /**
     * The quality of the document.
     */
    private quality : number = 90;

    /**
     * The name of the document.
     */
    private name : string = null;

    /**
     * A value indicating whether emojis should be used.
     */
    private emoji : string | boolean = true;

    /**
     * The attributes of the document.
     */
    private attributes : any = { };

    /**
     * The format to print the date.
     */
    private dateFormat : string = 'default';

    /**
     * The language to print values.
     */
    private locale : string = VSCode.env.language;

    /**
     * The layout of the document.
     */
    private layout : Layout = new Layout();

    /**
     * The header of the document.
     */
    private header : Header = null;

    /**
     * A set of special headers.
     */
    private specialHeaders : { [id : number] : Header } = { };

    /**
     * The header for even pages.
     */
    private evenHeader : Header = null;

    /**
     * The header for odd pages.
     */
    private oddHeader : Header = null;

    /**
     * The header for the last page.
     */
    private lastHeader : Header = null;

    /**
     * The footer of the document.
     */
    private footer : Footer = null;

    /**
     * A set of special footers.
     */
    private specialFooters : { [id : number] : Footer } = { };

    /**
     * The footer for even pages.
     */
    private evenFooter : Footer = null;

    /**
     * The footer for odd pages.
     */
    private oddFooter : Footer = null;

    /**
     * The footer for the last page.
     */
    private lastFooter : Footer = null;

    /**
     * The template to use for the RenderBody-process.
     */
    private template : string = Path.join(__dirname, '..', '..', 'Resources', 'Template.html');

    /**
     * The stylesheets of the document.
     */
    private styleSheets : string[] = [ ];

    /**
     * The styles of the document.
     */
    private styles : string = null;

    /**
     * The wrapper of the content of the document.
     */
    private wrapper : string = null;

    /**
     * The content of the document.
     */
    private content : string = null;

    /**
     * Initializes a new instance of the Document class with a file-path and a configuration.
     * 
     * @param filePath
     * The path to the file to load the content from.
     * 
     * @param config
     * The configuration to set.
     */
    constructor(filePath : string = null)
    {
        super();
        this.Attributes.Author = Fullname.FullName;
        this.Attributes.CreationDate = new Date();
        this.Attributes.PageNumber = '{{ PageNumber }}'; // {{ PageNumber }} will be replaced in the Phantom-Script (see "PDFGenerator.ts": ReplacePageNumbers)
        this.Attributes.PageCount = '{{ PageCount }}';   // {{ PageCount }}  will be replaced in the Phantom-Script (see "PDFGenerator.ts": ReplacePageNumbers)
        this.LoadConfig(this.config);

        if (filePath)
        {
            this.Content = FS.readFileSync(filePath, 'utf-8');
        }
    }

    /**
     * Gets or sets the quality of the document.
     */
    @enumerable(true)
    public get Quality() : number
    {
        return this.quality;
    }
    public set Quality(value : number)
    {
        this.quality = value;
    }

    /**
     * Gets or sets the name of the document.
     */
    @enumerable(true)
    public get Name() : string
    {
        return this.name;
    }
    public set Name(value : string)
    {
        this.name = value;
    }

    /**
     * Gets or sets the attributes of the document.
     */
    @enumerable(true)
    public get Attributes() : { [id : string] : any }
    {
        return this.attributes;
    }
    public set Attributes(value : { [id : string] : any })
    {
        this.attributes = value;
    }

    /**
     * Gets or sets the format to print the date.
     */
    @enumerable(true)
    public get DateFormat() : string
    {
        return this.dateFormat;
    }
    public set DateFormat(value : string)
    {
        this.dateFormat = value;
    }

    /**
     * Gets or sets the locale to print values.
     */
    @enumerable(true)
    public get Locale() : string
    {
        return this.locale;
    }
    public set Loacle(value : string)
    {
        this.locale = value;
    }

    /**
     * Gets or sets the layout of the document.
     */
    @enumerable(true)
    public get Layout() : Layout
    {
        return this.layout;
    }
    public set Layout(value : Layout)
    {
        this.layout = value;
    }

    /**
     * Gets or sets the header of the document.
     */
    @enumerable(true)
    public get Header() : Header
    {
        return this.header;
    }
    public set Header(value : Header)
    {
        this.header = value;
    }

    /**
     * Gets or sets a set of special headers.
     */
    @enumerable(true)
    public get SpecialHeaders() : { [id : number] : Header }
    {
        return this.specialHeaders;
    }
    public set SpecialHeaders(value : { [id : number] : Header })
    {
        this.specialHeaders = value;
    }

    /**
     * Gets or sets the header for even pages.
     */
    @enumerable(true)
    public get EvenHeader() : Header
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
    public set EvenHeader(value : Header)
    {
        this.evenHeader = value;
    }

    /**
     * Gets or sets the header for even pages.
     */
    @enumerable(true)
    public get OddHeader() : Header
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
    public set OddHeader(value : Header)
    {
        this.oddHeader = value;
    }

    /**
     * Gets or sets the header for the last page.
     */
    @enumerable(true)
    public get LastHeader() : Header
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
    public set LastHeader(value : Header)
    {
        this.lastHeader = value;
    }    

    /**
     * Gets or sets the footer of the document.
     */
    @enumerable(true)
    public get Footer() : Footer
    {
        return this.footer;
    }
    public set Footer(value : Footer)
    {
        this.footer = value;
    }

    /**
     * Gets or sets a set of special footers.
     */
    @enumerable(true)
    public get SpecialFooters() : { [id : number] : Footer }
    {
        return this.specialFooters;
    }
    public set SpecialFooters(value : { [id : number] : Footer })
    {
        this.specialFooters = value;
    }

    /**
     * Gets or sets the footer for even pages.
     */
    @enumerable(true)
    public get EvenFooter() : Footer
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
    public set EvenFooter(value : Footer)
    {
        this.evenFooter = value;
    }

    /**
     * Gets or sets the footer for odd pages.
     */
    @enumerable(true)
    public get OddFooter() : Footer
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
    public set OddFooter(value : Footer)
    {
        this.oddFooter = value;
    }

    /**
     * Gets or sets the footer for the last page.
     */
    @enumerable(true)
    public get LastFooter() : Footer
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
    public set LastFooter(value : Footer)
    {
        this.lastFooter = value;
    }

    /**
     * Gets or sets the template to use for the RenderBody-process.
     */
    @enumerable(true)
    public get Template() : string
    {
        return this.template;
    }
    public set Template(value : string)
    {
        this.template = value;
    }

    /**
     * Gets or sets the stylesheets of the document.
     */
    @enumerable(true)
    public get StyleSheets() : string[]
    {
        return this.styleSheets;
    }
    public set StyleSheets(value : string[])
    {
        this.styleSheets = value;
    }

    /**
     * Gets or sets the styles of the document.
     */
    @enumerable(true)
    public get Styles() : string
    {
        return this.styles;
    }
    public set Styles(value : string)
    {
        this.styles = value;
    }

    /**
     * Gets or sets the wrapper of the content of the document.
     */
    @enumerable(true)
    public get Wrapper() : string
    {
        return this.wrapper;
    }
    public set Wrapper(value : string)
    {
        this.wrapper = value;
    }

    /**
     * Gets or sets the content of the document.
     */
    @enumerable(true)
    public get Content() : string
    {
        return this.content;
    }
    public set Content(value : string)
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
    public toJSON() : string
    {
        let document : any = {
            Quality: this.Quality,
            Locale: this.Locale,
            Layout: this.Layout.toObject(),
            Header: this.RenderSection(this.Header),
            SpecialHeaders: { },
            EvenHeader: this.RenderSection(this.evenHeader),
            OddHeader: this.RenderSection(this.oddHeader),
            LastHeader: this.RenderSection(this.lastHeader),
            Content: this.RenderBody(),
            Footer: this.RenderSection(this.Footer),
            SpecialFooters: { },
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
    public get HTML() : string
    {
        return this.RenderBody();
    }

    /**
     * Renders a section of the document.
     * 
     * @param section
     * The section which is to be rendered.
     */
    private RenderSection(section : Section) : object
    {
        if (section)
        {
            let clone = (section.CloneTo(new Section()) as Section);
            clone.Content = (this.Render(section.Content) as string);
            return clone.toObject();
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
    private Render(content : string) : string
    {
        // Preparing markdown-it
        let md = new MarkdownIt({ html: true });
        md.use(Anchor);

        if (this.emoji)
        {
            var emoji = this.emoji;
            md.use(Emoji);
            md.renderer.rules.emoji = function(token, id) {
                switch (emoji)
                {
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
                            Utilities.UTF8CharToCodePoints(token[id].content).toString(16).toLowerCase() +
                            '.png" allign="absmiddle" />';
                }
            };
        }

        // Preparing the attributes
        let view = { };
        for (var key in this.Attributes)
        {
            let value = this.Attributes[key];
            if (value instanceof Date)
            {
                value = new DateTimeFormatter(this.Locale).Format(this.DateFormat, value);
            }
            view[key] =value;
        }
        
        let html = md.render(content);
        return Mustache.render(html, view);
    }

    /**
     * Loads the vs-config
     */
    private LoadConfig(config : VSCode.WorkspaceConfiguration) : void
    {
        if (config.has('attributes'))
        {
            let attributes = config.get('attributes');
            for (var key in attributes)
            {
                this.Attributes[key] = attributes[key];
            }
        }

        if (config.has('emoji'))
        {
            this.emoji = config.get<string | boolean>('emoji');
        }

        if (config.has('localization'))
        {
            let localization = config.get('localization');

            if ('locale' in localization)
            {
                this.locale = localization['locale'];
            }

            if ('dateFormat' in localization)
            {
                this.DateFormat = localization['dateFormat'];
            }
        }

        if (config.has('layout'))
        {
            let layout = config.get('layout');

            if ('margin' in layout)
            {
                let margin = layout['margin'];

                if ('top' in margin && 'right' in margin && 'bottom' in margin && 'bottom' in margin)
                {
                    this.Layout.Margin.Top = margin['top'];
                    this.Layout.Margin.Right = margin['right'];
                    this.Layout.Margin.Bottom = margin['bottom'];
                    this.Layout.Margin.Left = margin['left'];
                }
            }

            if ('format' in layout && 'orientation' in layout)
            {
                this.Layout.Format = layout['format'];
                this.Layout.Orientation = layout['orientation'];
            }
            else if ('width' in layout && 'height' in layout)
            {
                this.Layout.Width = layout['width'];
                this.Layout.Height = layout['height'];
            }
        }
    }

    /**
     * Renders the body of the document.
     */
    private RenderBody() : string
    {
        let template = FS.readFileSync(this.Template).toString();
        // Preparing the styles
        let styles = '<style>\n';
        if (this.Styles)
        {
            styles += this.Styles + '\n';
        }
        this.StyleSheets.forEach(styleSheet => {
            if (/(http|https)/g.test(URL.parse(styleSheet).protocol))
            {
                styles += '</style>\n<link rel="stylesheet" href="' + styleSheet + '" type="text/css">\n<style>';
            }
            else
            {
                // Removing leading 'file://' from the local path.
                styleSheet.replace(/^file:\/\//, function (match : string) : string
                {
                    return '';
                });
                if (FS.existsSync(Path.join(styleSheet)))
                {
                    styles += FS.readFileSync(styleSheet).toString() + '\n';
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
}

function enumerable(value)
{
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor)
    {
        descriptor.enumerable = value;
    };
}