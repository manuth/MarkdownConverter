import { PDFOptions } from "puppeteer-core";

/**
 * Represents the format of a paper.
 */
export abstract class PaperFormat
{
    /**
     * Gets the pdf-options for the paper-format.
     */
    public abstract get PDFOptions(): Partial<PDFOptions>;
}