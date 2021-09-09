import { PDFOptions } from "puppeteer-core";

/**
 * Represents the format of a page.
 */
export abstract class PageFormat
{
    /**
     * Gets the pdf-options for the page-format.
     */
    public abstract get PDFOptions(): Partial<PDFOptions>;
}
