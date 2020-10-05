import { isAbsolute } from "path";
import dedent = require("dedent");
import fm = require("front-matter");
import { pathExists, readFile, statSync } from "fs-extra";
import { CultureInfo } from "localized-resource-manager";
import MarkdownIt = require("markdown-it");
import { render } from "mustache";
import { TextDocument } from "vscode";
import { stringify } from "yamljs";
import { Resources } from "../../Properties/Resources";
import { DateTimeFormatter } from "../Globalization/DateTimeFormatter";
import { FileException } from "../IO/FileException";
import { YAMLException } from "../YAML/YAMLException";
import { DocumentFragment } from "./DocumentFragment";
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
     * The format to print the date.
     */
    private dateFormat = "Default";

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
    private styleSheets: string[] = [
        Resources.Files.Get("SystemStyle")
    ];

    /**
     * The ecma-scripts of the document.
     */
    private scripts: string[] = [];

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

        if (!document.isUntitled)
        {
            this.fileName = document.fileName;
            this.Attributes.CreationDate = statSync(document.fileName).ctime;
        }
        else
        {
            this.fileName = null;
            this.Attributes.CreationDate = new Date(Date.now());
        }

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
    public get DateFormat(): string
    {
        return this.dateFormat;
    }

    /**
     * @inheritdoc
     */
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
    public get StyleSheets(): string[]
    {
        return this.styleSheets;
    }

    /**
     * @inheritdoc
     */
    public set StyleSheets(value: string[])
    {
        this.styleSheets = value;
    }

    /**
     * Gets or sets the scripts of the document.
     */
    public get Scripts(): string[]
    {
        return this.scripts;
    }

    /**
     * @inheritdoc
     */
    public set Scripts(value: string[])
    {
        this.scripts = value;
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
            if (/.*:\/\//g.test(styleSheet) || !isAbsolute(styleSheet))
            {
                styleCode += dedent(`<link rel="stylesheet" type="text/css" href="${styleSheet}" />\n`);
            }
            else if (await pathExists(styleSheet))
            {
                styleCode += "<style>" + (await readFile(styleSheet)).toString() + "</style>\n";
            }
            else
            {
                throw new FileException(null, styleSheet);
            }
        }

        for (let script of this.Scripts)
        {
            if (/.*:\/\//g.test(script) || !isAbsolute(script))
            {
                scriptCode += dedent(`<script async="" src="${script}"charset="UTF-8"></script>\n`);
            }
            else if (await pathExists(script))
            {
                scriptCode += "<script>" + (await readFile(script)).toString() + "</script>\n";
            }
            else
            {
                throw new FileException(null, script);
            }
        }

        let content = this.Content;

        let view = {
            styles: styleCode,
            scripts: scriptCode,
            content: await this.RenderText(content)
        };

        return render(this.Template, view);
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
        let view: Record<string, unknown> = {};

        for (let key in this.Attributes)
        {
            let value = this.Attributes[key];

            if (value instanceof Date)
            {
                value = new DateTimeFormatter(this.Locale).Format(this.DateFormat, new Date(value));
            }

            view[key] = value;
        }

        let html = this.parser.render(content);
        return render(html, view);
    }
}
