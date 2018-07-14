import ConversionType from "./ConversionType";
import Document from "./System/Drawing/Document";
import * as FS from "fs";
import * as http from "http";
import * as Server from "http-server";
import * as Path from "path";
import Puppeteer = require("puppeteer");
import * as URL from "url";

/**
 * Provides a markdown-converter.
 */
export default class Converter
{
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
    constructor(document: Document)
    {
        this.document = document;
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
        let htmlCode = await this.document.Render();

        if (conversionType !== ConversionType.HTML)
        {
            let server = (Server.createServer({
                root: "."
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

                await page.goto(URL.resolve("http://localhost:8980/", Path.relative(process.cwd(), this.document.FileName)));

                switch (conversionType)
                {
                    case ConversionType.PDF:
                        let jsonDocument = await this.document.toJSON();
                        let styles = `
                        <style>
                            :root
                            {
                                font-size: 11px;
                            }
                        </style>`;
                        let pdfOptions: Partial<Puppeteer.PDFOptions> = {
                            margin: {
                                top: this.document.Paper.Margin.Top,
                                right: this.document.Paper.Margin.Right,
                                bottom: this.document.Paper.Margin.Bottom,
                                left: this.document.Paper.Margin.Left
                            },
                            printBackground: true,
                            path
                        };

                        Object.assign(pdfOptions, this.document.Paper.Format.PDFOptions);

                        if (jsonDocument.HeaderFooterEnabled)
                        {
                            pdfOptions.displayHeaderFooter = true;
                            pdfOptions.headerTemplate = styles + jsonDocument.Header;
                            pdfOptions.footerTemplate = styles + jsonDocument.Footer;
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
                            screenshotOptions.quality = this.document.Quality;
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
            FS.writeFileSync(path, htmlCode);
        }
    }
}