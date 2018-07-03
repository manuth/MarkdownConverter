import { PDFOptions } from "puppeteer";

/**
 * Represents the format of a paper.
 */
export default abstract class PaperFormat
{
    /**
     * Gets the pdf-options for the paper-format.
     */
    public abstract get PDFOptions(): Partial<PDFOptions>;
}