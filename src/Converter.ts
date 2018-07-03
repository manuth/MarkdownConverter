import * as FS from "fs";
import Document from "./System/Drawing/Document";
import ConversionType from "./ConversionType";
import Puppeteer = require("puppeteer");
import StandardizedPaperFormat from "./System/Drawing/StandardizedPaperFormat";
import CustomPaperFormat from "./System/Drawing/CustomPaperFormat";

/**
 * Provides a markdown-converter.
 */
export default class Converter
{
    /**
     * The document which is to be converted.
     */
    private document: Document = null;

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
        if (conversionType !== ConversionType.HTML)
        {
            let browser = await Puppeteer.launch();
            let page = await browser.newPage();
            await page.setContent(this.document.HTML);

            switch (conversionType)
            {
                case ConversionType.PDF:
                    let jsonDocument = this.document.toJSON();
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
        else
        {
            FS.writeFileSync(path, this.document.HTML);
        }
    }
}