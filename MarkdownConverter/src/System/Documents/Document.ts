import Dedent = require("dedent");
import FrontMatter = require("front-matter");
import FileSystem = require("fs-extra");
import { CultureInfo } from "localized-resource-manager";
import MarkdownIt = require("markdown-it");
import Mustache = require("mustache");
import OS = require("os");
import Path = require("path");
import { TextDocument } from "vscode";
import YAML = require("yamljs");
import { Resources } from "../../Properties/Resources";
import { DateTimeFormatter } from "../Globalization/DateTimeFormatter";
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
    public fileName: string;

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
    private template: string = Dedent(`
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
     * @param config
     * The configuration to set.
     */
    constructor(document: TextDocument, parser: MarkdownIt)
    {
        super();
        this.RawContent = document.getText();

        if (!document.isUntitled)
        {
            this.fileName = document.fileName;
            this.Attributes.CreationDate = FileSystem.statSync(document.fileName).ctime;
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
     * Gets or sets the scripts of the document.
     */
    public get Scripts(): string[]
    {
        return this.scripts;
    }

    public set Scripts(value: string[])
    {
        this.scripts = value;
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
                styleCode += Dedent(`<link rel="stylesheet" type="text/css" href="${styleSheet}" />\n`);
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

        for (let script of this.Scripts)
        {
            if (/.*:\/\//g.test(script) || !Path.isAbsolute(script))
            {
                scriptCode += Dedent(`<script async="" src="${script}"charset="UTF-8"></script>\n`);
            }
            else
            {
                if (await FileSystem.pathExists(script))
                {
                    scriptCode += "<script>" + (await FileSystem.readFile(script)).toString() + "</script>\n";
                }
                else
                {
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

    /**
     * Renders content of the document.
     *
     * @param content
     * The content which is to be rendered.
     */
    protected async RenderText(content: string): Promise<string>
    {
        let view: { [key: string]: string } = {};

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
        return Mustache.render(html, view);
    }
}