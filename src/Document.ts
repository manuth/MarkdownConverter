import * as fs from 'fs';
import * as Path from 'path';
import * as VSCode from 'vscode';
import { DateTimeFormatter } from './Core/DateTimeFormatter';
import * as FrontMatter from 'front-matter';
import { Fullname } from './Core/Fullname';
import * as MarkdownIt from 'markdown-it';
import * as Mustache from 'mustache';
import * as Emoji from 'markdown-it-emoji';
import { Header, Footer, Section } from './Section';
import { Base } from "./Core/Base";

/**
 * Represents a document.
 */
export class Document extends Base
{
    /**
     * The encoding of the document to load and save.
     */
    private encoding : string;

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
     * The header of the document.
     */
    private header : Header;

    /**
     * A set of special headers.
     */
    private specialHeaders : { [id : number] : Header } = { };

    /**
     * The header for even pages.
     */
    private evenHeader : Header;

    /**
     * The header for odd pages.
     */
    private oddHeader : Header;

    /**
     * The header for the last page.
     */
    private lastHeader : Header;

    /**
     * The footer of the document.
     */
    private footer : Footer;

    /**
     * A set of special footers.
     */
    private specialFooters : { [id : number] : Footer } = { };

    /**
     * The footer for even pages.
     */
    private evenFooter : Footer;

    /**
     * The footer for odd pages.
     */
    private oddFooter : Footer;

    /**
     * The footer for the last page.
     */
    private lastFooter : Footer;

    /**
     * The stylesheets of the document.
     */
    private styleSheets : string[] = [ ];

    /**
     * The styles of the document.
     */
    private styles : string = null;

    /**
     * The content of the document.
     */
    private content : string;

    constructor(filePath : string = null)
    {
        super();
        this.Attributes.Author = Fullname.FullName;
        this.Attributes.CreationDate = new Date();
        this.Attributes.PageNumber = '{{ PageNumber }}'; // {{ PageNumber }} will be replaced in the Phantom-Script (see "PDFGenerator.ts")
        this.Attributes.PageCount = '{{ PageCount }}';   // {{ PageCount }}  will be replaced in the Phantom-Script (see "PDFGenerator.ts")
        this.Header = new Header('46mm', '<table style="width: 100%"><td></td><td></td></table>');
        this.Footer = new Footer('28mm', '<table style="width: 100%"><td></td><td></td></table>');
        this.LoadConfig();
        if (filePath)
        {
            this.Content = fs.readFileSync(filePath, this.encoding);
        }
    }

    /**
     * Gets or sets the encoding of the document to load and save.
     */
    @enumerable(true)
    public get Encoding() : string
    {
        return this.encoding;
    }
    public set Encoding(value : string)
    {
        this.encoding = value;
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
            Locale: this.Locale,
            Header: this.RenderSection(this.Header),
            SpecialHeaders: { },
            Content: this.RenderBody(),
            Footer: this.RenderSection(this.Footer)
        }

        for (var key in this.SpecialHeaders)
        {
            document.SpecialHeaders[key] = this.RenderSection(this.SpecialHeaders[key]);
        }

        if (this.evenHeader)
        {
            document.EvenHeader = this.RenderSection(this.evenHeader);
        }

        if (this.oddHeader)
        {
            document.OddHeader = this.RenderSection(this.OddHeader);
        }

        if (this.lastHeader)
        {
            document.LastHeader = this.RenderSection(this.LastHeader);
        }

        for (var key in this.SpecialFooters)
        {
            document.SpecialFooters[key] = this.RenderSection(this.SpecialFooters[key]);
        }

        if (this.evenFooter)
        {
            document.EvenFooter = this.RenderSection(this.EvenFooter);
        }

        if (this.oddFooter)
        {
            document.OddFooter = this.RenderSection(this.OddFooter);
        }

        if (this.lastFooter)
        {
            document.LastFooter = this.RenderSection(this.LastFooter);
        }

        return JSON.stringify(document);
    }

    /**
     * Gets the HTML-code which represents the content of the document.
     */
    public get HTML() : string
    {
        return this.RenderBody();
        //return this.Render(this.Content);
    }

    /**
     * Renders a section of the document.
     * 
     * @param section
     * The section which is to be rendered.
     */
    private RenderSection(section : Section) : object
    {
        let clone = (section.CloneTo(new Section()) as Section);
        clone.Content = (this.Render(section.Content) as string);
        return JSON.parse(clone.toJSON());
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
        let md = new MarkdownIt();
        md.use(Emoji);

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
    private LoadConfig() : void
    {
        let prefix = 'markdownConverter';
        let config : any = VSCode.workspace.getConfiguration();
        if (config.has(prefix))
        {
            if (config.has(prefix + '.encoding'))
            {
                this.Encoding = config.get(prefix + '.encoding');
            }
            if (config.has(prefix + '.locale'))
            {
                this.locale = config.get(prefix + '.locale');
            }
            if (config.has(prefix + '.dateFormat'))
            {
                this.DateFormat = config.get(prefix + '.dateFormat');
            }
        }
    }

    private RenderBody() : string
    {
        let template = fs.readFileSync(Path.join(__dirname, '..', '..', 'Resources', 'Template.html')).toString();
        // Preparing the styles
        let styles = '<style>\n';
        if (this.Styles)
        {
            styles += this.Styles + '\n';
        }
        this.StyleSheets.forEach(styleSheet => {
            if (fs.existsSync(Path.join(__dirname, styleSheet)))
            {
                styles += fs.readFileSync(Path.join(__dirname, styleSheet)).toString() + '\n';
            }
        });
        styles += '</style>';

        let view = {
            styles: styles,
            content: this.Render(this.Content)
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