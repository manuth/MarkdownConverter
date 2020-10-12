import { CultureInfo } from "@manuth/resource-manager";
import dedent = require("dedent");
import fm = require("front-matter");
import { statSync } from "fs-extra";
import Handlebars = require("handlebars");
import MarkdownIt = require("markdown-it");
import { TextDocument } from "vscode";
import { stringify } from "yamljs";
import { DateTimeFormatter } from "../Globalization/DateTimeFormatter";
import { YAMLException } from "../YAML/YAMLException";
import { Asset } from "./Assets/Asset";
import { DocumentFragment } from "./DocumentFragment";
import { Paper } from "./Paper";
import { Renderable } from "./Renderable";

/**
 * Represents a document.
 */
export class Document extends Renderable
{
    /**
     * The attribute-key for overriding the default date-format.
     */
    private static readonly dateFormatKey = "DateFormat";

    /**
     * The name of the file represented by this document.
     */
    private fileName: string;

    /**
     * The quality of the document.
     */
    private quality = 90;

    /**
     * The attributes of the document.
     */
    private attributes: { [key: string]: any } = {};

    /**
     * A component for rendering the document.
     */
    private renderer: typeof Handlebars = null;

    /**
     * The format to print the date.
     */
    private defaultDateFormat = "Default";

    /**
     * A set of custom date-formats.
     */
    private dateFormats: Record<string, string> = {};

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
    private headerFooterEnabled = false;

    /**
     * The header of the document.
     */
    private header: DocumentFragment = new DocumentFragment(this);

    /**
     * The footer of the document.
     */
    private footer: DocumentFragment = new DocumentFragment(this);

    /**
     * The template to use for the RenderBody-process.
     */
    private template: string = dedent(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
                {{{styles}}}
            </head>
            <body class="markdown-body">
                {{{content}}}
                {{{scripts}}}
            </body>
        </html>`);

    /**
     * The stylesheets of the document.
     */
    private styleSheets: Asset[] = [];

    /**
     * The ecma-scripts of the document.
     */
    private scripts: Asset[] = [];

    /**
     * The parser for parsing the markdown-content.
     */
    private parser: MarkdownIt;

    /**
     * Initializes a new instance of the Document class with a file-path and a configuration.
     *
     * @param document
     * The `TextDocument` to load the info from.
     *
     * @param parser
     * The parser for rendering the document.
     */
    public constructor(document: TextDocument, parser: MarkdownIt)
    {
        super();
        this.RawContent = document.getText();
        this.fileName = document.isUntitled ? null : document.fileName;
        this.parser = parser;
    }

    /**
     * Gets or sets the name of the file represented by this document.
     */
    public get FileName(): string
    {
        return this.fileName;
    }

    /**
     * Gets or sets the raw version of the content.
     */
    public get RawContent(): string
    {
        return (
            "---\n" +
            stringify(this.Attributes).trim() + "\n" +
            "---\n" +
            this.Content);
    }

    /**
     * @inheritdoc
     */
    public set RawContent(value: string)
    {
        try
        {
            let result = (fm as any)(value);
            this.Attributes = result.attributes;
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

    /**
     * @inheritdoc
     */
    public set Quality(value: number)
    {
        this.quality = value;
    }

    /**
     * Gets or sets the attributes of the document.
     */
    public get Attributes(): Record<string, unknown>
    {
        return this.attributes;
    }

    /**
     * @inheritdoc
     */
    public set Attributes(value: Record<string, unknown>)
    {
        this.attributes = value;
    }

    /**
     * Gets or sets the format to print the date.
     */
    public get DefaultDateFormat(): string
    {
        return this.defaultDateFormat;
    }

    /**
     * @inheritdoc
     */
    public set DefaultDateFormat(value: string)
    {
        this.defaultDateFormat = value;
    }

    /**
     * Gets or sets a collection of custom date-formats.
     */
    public get DateFormats(): Record<string, string>
    {
        return this.dateFormats;
    }

    /**
     * @inheritdoc
     */
    public set DateFormats(value: Record<string, string>)
    {
        this.dateFormats = value;
    }

    /**
     * Gets or sets the locale to print values.
     */
    public get Locale(): CultureInfo
    {
        return this.locale;
    }

    /**
     * @inheritdoc
     */
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

    /**
     * @inheritdoc
     */
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

    /**
     * @inheritdoc
     */
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
     * Gets or sets the template to use for the RenderBody-process.
     */
    public get Template(): string
    {
        return this.template;
    }

    /**
     * @inheritdoc
     */
    public set Template(value: string)
    {
        this.template = value;
    }

    /**
     * Gets or sets the stylesheets of the document.
     */
    public get StyleSheets(): Asset[]
    {
        return this.styleSheets;
    }

    /**
     * @inheritdoc
     */
    public set StyleSheets(value: Asset[])
    {
        this.styleSheets = value;
    }

    /**
     * Gets or sets the scripts of the document.
     */
    public get Scripts(): Asset[]
    {
        return this.scripts;
    }

    /**
     * @inheritdoc
     */
    public set Scripts(value: Asset[])
    {
        this.scripts = value;
    }

    /**
     * Gets a component for rendering the document.
     */
    protected get Renderer(): typeof Handlebars
    {
        if (this.renderer === null)
        {
            this.renderer = Handlebars.create();

            this.Renderer.registerHelper(
                "FormatDate",
                (value: any, format: string) =>
                {
                    return this.FormatDate(value, format);
                });
        }

        return this.renderer;
    }

    /**
     * Renders the body of the document.
     *
     * @returns
     * The rendered text.
     */
    public async Render(): Promise<string>
    {
        let styleCode = "";
        let scriptCode = "";

        for (let styleSheet of this.StyleSheets)
        {
            styleCode += styleSheet.ToString();
        }

        for (let script of this.Scripts)
        {
            scriptCode += script.ToString();
        }

        let content = this.Content;

        let view = {
            styles: styleCode,
            scripts: scriptCode,
            content: await this.RenderText(content)
        };

        return this.Renderer.compile(this.Template)(view);
    }

    /**
     * Renders content of the document.
     *
     * @param content
     * The content which is to be rendered.
     *
     * @returns
     * The rendered text.
     */
    protected async RenderText(content: string): Promise<string>
    {
        let view: Record<string, unknown> = { ...this.Attributes };
        let dateHelpers: string[] = [];
        let creationDateKey = "CreationDate";
        let changeDateKey = "ChangeDate";

        let dateResolver = (key: string): Date =>
        {
            if (this.FileName)
            {
                switch (key)
                {
                    case creationDateKey:
                        return statSync(this.FileName).birthtime;
                    case changeDateKey:
                        return statSync(this.FileName).mtime;
                    default:
                        return new Date();
                }
            }
            else
            {
                return new Date();
            }
        };

        for (let key of [creationDateKey, changeDateKey])
        {
            if (!(key in view))
            {
                view[key] = dateResolver(key);
            }
        }

        for (let key in view)
        {
            let value = view[key];

            if (value instanceof Date)
            {
                dateHelpers.push(key);
                this.Renderer.registerHelper(key, () => this.FormatDate(value as Date, this.DefaultDateFormat));
            }

            view[key] = value;
        }

        let renderedContent = this.Renderer.compile(content)(view);

        for (let key of dateHelpers)
        {
            this.Renderer.unregisterHelper(key);
        }

        return this.parser.render(renderedContent);
    }

    /**
     * Formats the specified date-`value`.
     *
     * @param value
     * The date to format.
     *
     * @param format
     * The format to apply.
     *
     * @returns
     * The formatted date.
     */
    protected FormatDate(value: string | Date, format?: string): string
    {
        if (format !== null)
        {
            format = format ?? this.DefaultDateFormat;
        }

        if (format)
        {
            return new DateTimeFormatter(this.Locale).Format(
                (format in this.DateFormats) ? this.DateFormats[format] : format,
                new Date(value));
        }
        else
        {
            return value.toString();
        }
    }
}
