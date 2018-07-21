import * as FS from "fs-extra";
import * as http from "http";
import * as Server from "http-server";
import * as Path from "path";
import Puppeteer = require("puppeteer");
import * as URL from "url";
import ConversionType from "./ConversionType";
import Document from "./System/Drawing/Document";

/**
 * Provides a markdown-converter.
 */
export default class Converter
{
    /**
     * The root-directory of the document.
     */
    private documentRoot: string;

    /**
     * The document which is to be converted.
     */
    private document: Document;

    /**
     * Initializes a new instance of the Constructor class with a filepath.
     * 
     * @param document
     * The document which is to be converted.
     */
    constructor(documentRoot: string, document: Document)
    {
        this.documentRoot = documentRoot;
        this.document = document;
    }

    /**
     * Gets or sets the root-directory of the document.
     */
    public get DocumentRoot(): string
    {
        return this.documentRoot;
    }

    public set DocumentRoot(value: string)
    {
        this.documentRoot = value;
    }

    /**
     * Gets the document which is converted by this `Converter`.
     */
    public get Document(): Document
    {
        return this.document;
    }

    /**
     * Starts the conversion.
     * 
     * @param conversionType
     * The type to convert the document to.
     * 
     * @param path
     * The path to save the converted file to.
     */
    public async Start(conversionType: ConversionType, path: string): Promise<void>
    {
        let htmlCode = await this.Document.Render();

        if (conversionType !== ConversionType.HTML)
        {
            let server = (Server.createServer({
                root: this.DocumentRoot
            }) as any).server as http.Server;

            server.listen(8980, "localhost");

            try
            {
                let browser = await Puppeteer.launch();
                let page = await browser.newPage();
                page.setRequestInterception(true);
                page.once(
                    "request",
                    request =>
                    {
                        request.respond({
                            body: htmlCode
                        });

                        page.on("request", nextRequest => nextRequest.continue());
                    });

                let url = this.Document.FileName !== null ? Path.relative(this.DocumentRoot, this.Document.FileName) : "";
                await page.goto(URL.resolve("http://localhost:8980/", url));

                switch (conversionType)
                {
                    case ConversionType.PDF:
                        let styles = `
                        <style>
                            :root
                            {
                                font-size: 11px;
                            }
                        </style>`;
                        let pdfOptions: Partial<Puppeteer.PDFOptions> = {
                            margin: {
                                top: this.Document.Paper.Margin.Top,
                                right: this.Document.Paper.Margin.Right,
                                bottom: this.Document.Paper.Margin.Bottom,
                                left: this.Document.Paper.Margin.Left
                            },
                            printBackground: true,
                            path
                        };

                        Object.assign(pdfOptions, this.Document.Paper.Format.PDFOptions);

                        if (this.Document.HeaderFooterEnabled)
                        {
                            pdfOptions.displayHeaderFooter = true;
                            pdfOptions.headerTemplate = styles + await this.Document.Header.Render();
                            pdfOptions.footerTemplate = styles + await this.Document.Footer.Render();
                        }

                        await page.pdf(pdfOptions);
                        break;
                    default:
                        let screenshotOptions: Partial<Puppeteer.ScreenshotOptions> = {
                            fullPage: true,
                            path
                        };

                        if (conversionType !== ConversionType.PNG)
                        {
                            screenshotOptions.quality = this.Document.Quality;
                        }

                        await page.screenshot(screenshotOptions);
                        break;
                }
            }
            catch (exception)
            {
                throw exception;
            }
            finally
            {
                server.close();
            }
        }
        else
        {
            await FS.writeFile(path, htmlCode);
        }
    }
}