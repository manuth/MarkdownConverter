import PaperFormat from "./PaperFormat";
import { PDFOptions, PDFFormat } from "puppeteer";

/**
 * Represents a standardized format of a paper.
 */
export default class StandardizedPaperFormat extends PaperFormat
{
    /**
     * The paper-format.
     */
    private format: string = "A4";

    /**
     * The paper-orientation.
     */
    private orientation: string = "Portrait";

    /**
     * Gets or sets the paper-format.
     */
    public get Format(): string
    {
        return this.format;
    }

    public set Format(value: string)
    {
        this.format = value;
    }

    /**
     * Gets or sets the paper-orientation.
     */
    public get Orientation(): string
    {
        return this.orientation;
    }

    public set Orientation(value: string)
    {
        this.orientation = value;
    }

    public get PDFOptions(): Partial<PDFOptions>
    {
        return {
            format: this.Format as PDFFormat,
            landscape: this.Orientation === "Landspace"
        };
    }
}