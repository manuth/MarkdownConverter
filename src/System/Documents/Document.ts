import { parse } from "path";
import { CultureInfo } from "@manuth/resource-manager";
import dedent = require("dedent");
import fm = require("front-matter");
import MarkdownIt = require("markdown-it");
import { TextDocument } from "vscode";
import YAML = require("yamljs");
import { YAMLException } from "../YAML/YAMLException";
import { Asset } from "./Assets/Asset";
import { AttributeKey } from "./AttributeKey";
import { DocumentFragment } from "./DocumentFragment";
import { MarkdownFragment } from "./MarkdownFragment";
import { Paper } from "./Paper";
import { Renderable } from "./Renderable";

/**
 * Represents a document.
 */
export class Document extends Renderable
{
    /**
     * The name of the file represented by this document.
     */
    private fileName: string = null;

    /**
     * The title of the document.
     */
    private title: string;

    /**
     * The quality of the document.
     */
    private quality = 90;

    /**
     * The attributes of the document.
     */
    private attributes: { [key: string]: any } = {};

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
     * The body of the document.
     */
    private body: DocumentFragment = new MarkdownFragment(this);

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
     * The metadata-section of the document.
     */
    private meta: DocumentFragment = new DocumentFragment(this);

    /**
     * The template to use for the RenderBody-process.
     */
    private template: string = dedent(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
                {{{meta}}}
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
     * @param parser
     * The parser for rendering the document.
     *
     * @param document
     * The `TextDocument` to load the info from.
     */
    public constructor(parser: MarkdownIt, document?: TextDocument)
    {
        super();

        if (document)
        {
            this.RawContent = document.getText();
            this.fileName = document.isUntitled ? null : document.fileName;

            if (document.isUntitled)
            {
                this.title = document.uri.fsPath;
            }
            else
            {
                this.fileName = document.fileName;
                this.title = parse(this.FileName).name;
            }
        }
        else
        {
            this.title = "Untitled";
        }

        this.parser = parser;

        this.Meta.Content = dedent(`
            <title>{{{ Title }}}</title>`);
    }

    /**
     * Gets the name of the file represented by this document.
     */
    public get FileName(): string
    {
        return this.fileName;
    }

    /**
     * Gets the title of the document.
     */
    public get Title(): string
    {
        return (this.Attributes[AttributeKey.Title] as string) ?? this.title;
    }

    /**
     * Gets the body of the document.
     */
    protected get Body(): DocumentFragment
    {
        return this.body;
    }

    /**
     * Gets or sets the raw version of the content.
     */
    public get RawContent(): string
    {
        return (
            "---\n" +
            YAML.stringify(this.Attributes).trim() + "\n" +
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
     * Gets or sets the content of the component.
     */
    public override get Content(): string
    {
        return this.Body.Content;
    }

    /**
     * @inheritdoc
     */
    public override set Content(value: string)
    {
        this.Body.Content = value;
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
     * Gets the header of the document.
     */
    public get Header(): DocumentFragment
    {
        return this.header;
    }

    /**
     * Gets the footer of the document.
     */
    public get Footer(): DocumentFragment
    {
        return this.footer;
    }

    /**
     * Gets the metadata-section of the document.
     */
    public get Meta(): DocumentFragment
    {
        return this.meta;
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
     * Gets the parser of the document.
     */
    public get Parser(): MarkdownIt
    {
        return this.parser;
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

        let view = {
            meta: await this.Meta.Render(),
            styles: styleCode,
            scripts: scriptCode,
            content: await this.Body.Render()
        };

        return this.Body.Renderer.compile(this.Template)(view);
    }
}
