import PaperFormat from "./PaperFormat";
import { PDFOptions, PDFFormat } from "puppeteer";
import StandardizedFormatType from "./StandardizedFormatType";
import PaperOrientation from "./PaperOrientation";

/**
 * Represents a standardized format of a paper.
 */
export default class StandardizedPaperFormat extends PaperFormat
{
    /**
     * The format of the paper.
     */
    private format: StandardizedFormatType = StandardizedFormatType.A4;

    /**
     * The orientation of the paper.
     */
    private orientation: PaperOrientation = PaperOrientation.Portrait;

    /**
     * Gets or sets the format of the paper.
     */
    public get Format(): StandardizedFormatType
    {
        return this.format;
    }

    public set Format(value: StandardizedFormatType)
    {
        this.format = value;
    }

    /**
     * Gets or sets the orientation of the paper.
     */
    public get Orientation(): PaperOrientation
    {
        return this.orientation;
    }

    public set Orientation(value: PaperOrientation)
    {
        this.orientation = value;
    }

    public get PDFOptions(): Partial<PDFOptions>
    {
        return {
            format: StandardizedFormatType[this.Format] as PDFFormat,
            landscape: this.Orientation === PaperOrientation.Landscape
        };
    }
}